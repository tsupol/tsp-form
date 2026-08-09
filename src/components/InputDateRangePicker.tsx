import { forwardRef, useState, useRef, useEffect, useCallback, ReactNode, KeyboardEvent } from 'react';
import clsx from 'clsx';
import { Input, InputProps } from './Input';
import { MaskedInput } from './MaskedInput';
import { PopOver } from './PopOver';
import { Chevron } from './Chevron';
import { DatePicker, DatePickerProps } from './DatePicker';
import { DateRangePreset } from './dateRangePresets';
import '../styles/daterange.css';

export type InputDateRangePickerProps = Omit<InputProps, 'value' | 'onChange' | 'endIcon' | 'onEndIconClick'> & {
  fromDate?: Date | null;
  toDate?: Date | null;
  onFromDateChange?: (date: Date | null) => void;
  onToDateChange?: (date: Date | null) => void;
  datePickerProps?: Omit<DatePickerProps, 'selectedDate' | 'fromDate' | 'toDate' | 'onChange' | 'onToDateChange' | 'mode'>;
  dateFormat?: (fromDate: Date | null, toDate: Date | null) => string;
  endIcon?: ReactNode;
  onEndIconClick?: () => void;
  defaultStartTime?: { hours: number; minutes: number };
  defaultEndTime?: { hours: number; minutes: number };
  locale?: string;
  /** 'locale' uses the locale's native calendar (e.g. Buddhist for Thai), 'gregorian' always uses Gregorian */
  calendar?: 'locale' | 'gregorian';
  error?: boolean;
  size?: "sm" | "md" | "lg";
  /** Controlled typing mode — when true, shows a MaskedInput overlay for keyboard date range entry */
  typingMode?: boolean;
  /** Called when typing mode should change */
  onTypingModeChange?: (typing: boolean) => void;
  /** Mask pattern for typing mode (e.g. '##/##/#### - ##/##/####') */
  typingMask?: string;
  /** Parse the raw digits from the mask into from/to dates. Return null values if invalid. */
  parseTypedDates?: (rawDigits: string) => { from: Date | null; to: Date | null };
  /** Placeholder shown in the MaskedInput during typing mode */
  typingPlaceholder?: string;
  /**
   * Relative range presets ("Last 7 days", …) shown as a rail beside the calendar.
   * Omit to render the calendar alone. Use `defaultDateRangePresets` for the built-in set.
   */
  presets?: DateRangePreset[];
  /**
   * Key of the currently active preset, or null when the range came from the calendar.
   * Persist this to recompute the range on load via `resolveDateRangePreset`.
   */
  presetKey?: string | null;
  /** Fires with the preset key on preset click, and with null on any calendar edit. */
  onPresetKeyChange?: (key: string | null) => void;
  /** Heading above the preset rail. Pass null to hide it. Defaults to 'Quick ranges'. */
  presetsLabel?: ReactNode;
  /**
   * Close the popover after clicking a preset. Default false — the picker stays
   * open so the applied range is visible and adjustable on the calendar.
   */
  closeOnPresetSelect?: boolean;
  /**
   * Pins how many presets stay inline on narrow viewports before the rest move
   * into a "More" popover. Leave unset (recommended) to measure the actual
   * label widths and fit as many as the rail allows — which adapts to
   * translations and screen sizes on its own. Ignored on desktop.
   */
  mobilePresetCount?: number;
  /** Label for the overflow button on narrow viewports. Defaults to 'More'. */
  moreLabel?: string;
};

const hasTime = (date: Date | null) =>
  date !== null && (date.getHours() !== 0 || date.getMinutes() !== 0);

/** Must match the @media breakpoint in daterange.css that turns the rail horizontal. */
const NARROW_QUERY = '(max-width: 480px)';

/**
 * Tracks the narrow-viewport breakpoint. `enabled` is false when no presets are
 * passed, so the listener is skipped entirely for the common case.
 */
function useIsNarrow(enabled: boolean): boolean {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(NARROW_QUERY);
    setIsNarrow(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [enabled]);

  return isNarrow;
}

/**
 * Measures how many presets actually fit on one row of the horizontal rail.
 *
 * A fixed count can't know label widths, so it has to be tuned per language and
 * per device. This measures instead: the rail renders every preset once
 * (`measuring`), we read their real widths, then fit as many as the container
 * allows while reserving room for the More button.
 *
 * Returns `null` while measuring or when inactive — callers treat that as
 * "show everything", which is also the correct no-JS / desktop behaviour.
 */
function useFittedCount(
  active: boolean,
  railRef: React.RefObject<HTMLDivElement | null>,
  presetCount: number,
  // Re-measure when labels change (translation swap) or items are added.
  signature: string
): { fitted: number | null; measuring: boolean } {
  const [fitted, setFitted] = useState<number | null>(null);
  const [measuring, setMeasuring] = useState(false);

  // Re-enter the measuring pass whenever the inputs change.
  useEffect(() => {
    if (!active) {
      setFitted(null);
      setMeasuring(false);
      return;
    }
    setMeasuring(true);
  }, [active, signature, presetCount]);

  useEffect(() => {
    if (!active || !measuring) return;

    const measure = () => {
      // Resolve the ref inside the frame: on the first pass the rail mounts in
      // the same commit as this effect, so railRef.current is still null when
      // the effect body runs.
      const rail = railRef.current;
      if (!rail) return false;
      const items = Array.from(
        rail.querySelectorAll<HTMLElement>('[data-preset-item]')
      );
      if (!items.length || !rail.clientWidth) return false;

      const railStyle = getComputedStyle(rail);
      const padding =
        parseFloat(railStyle.paddingLeft || '0') +
        parseFloat(railStyle.paddingRight || '0');
      const gap = parseFloat(railStyle.columnGap || railStyle.gap || '0') || 0;
      // The popover is width:auto, so the rail sizes to its own content while
      // measuring and can't report the real constraint. The viewport is what
      // actually bounds it on mobile.
      const available = Math.min(window.innerWidth, rail.clientWidth) - padding;

      // The More button is not in the DOM during the probe pass; reserve a slot
      // for it so adding it later can't push the last preset off the row.
      const moreEl = rail.querySelector<HTMLElement>('[data-preset-more]');
      const moreWidth = moreEl ? moreEl.getBoundingClientRect().width : 72;

      let used = 0;
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        const w = items[i].getBoundingClientRect().width;
        const next = used + (count > 0 ? gap : 0) + w;
        // Every preset but the last must leave room for the More button.
        const needsMore = i < items.length - 1;
        const limit = needsMore ? available - moreWidth - gap : available;
        if (next > limit) break;
        used = next;
        count++;
      }

      // Always keep at least one inline, else the rail is just a More button.
      setFitted(Math.max(1, count));
      setMeasuring(false);
      return true;
    };

    // Measure after paint so widths are final. The popover mounts via a portal
    // with an open delay, so retry for a few frames until the rail is there
    // rather than bailing on the first miss and never resolving.
    let raf = 0;
    let attempts = 0;
    const tick = () => {
      const done = measure();
      if (!done && attempts++ < 20) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, measuring, railRef, presetCount, signature]);

  // Re-measure when the viewport changes (rotation, split-screen). Deliberately
  // NOT a ResizeObserver on the rail: entering and leaving the measuring pass
  // toggles the rail between absolute and static, which changes its own width
  // and would retrigger measuring forever.
  useEffect(() => {
    if (!active || typeof window === 'undefined') return;
    const onResize = () => setMeasuring(true);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [active]);

  return { fitted, measuring };
}

function resolveLocale(locale: string, calendar: 'locale' | 'gregorian'): string {
  return calendar === 'gregorian' ? `${locale}-u-ca-gregory` : locale;
}

const createDateRangeFormat = (locale: string, calendar: 'locale' | 'gregorian') => {
  const resolved = resolveLocale(locale, calendar);
  return (fromDate: Date | null, toDate: Date | null): string => {
    if (!fromDate && !toDate) return '';

    const showTime = hasTime(fromDate) || hasTime(toDate);

    const formatDate = (date: Date | null) => {
      if (!date) return '';
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(showTime && { hour: 'numeric', minute: '2-digit' }),
      };
      return date.toLocaleString(resolved, opts);
    };

    const from = formatDate(fromDate);
    const to = formatDate(toDate);

    if (from && to) {
      return `${from} - ${to}`;
    } else if (from) {
      return from;
    }

    return '';
  };
};

export const InputDateRangePicker = forwardRef<HTMLInputElement, InputDateRangePickerProps>(
  ({
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
    datePickerProps,
    dateFormat,
    endIcon,
    onEndIconClick,
    defaultStartTime,
    defaultEndTime,
    locale = 'en-US',
    calendar = 'locale',
    error,
    size,
    typingMode,
    onTypingModeChange,
    typingMask,
    parseTypedDates,
    typingPlaceholder,
    presets,
    presetKey,
    onPresetKeyChange,
    presetsLabel,
    closeOnPresetSelect = false,
    mobilePresetCount,
    moreLabel = 'More',
    ...inputProps
  }, ref) => {
    const formatRange = dateFormat ?? createDateRangeFormat(locale, calendar);
    const [isOpen, setIsOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const openCountRef = useRef(0);
    const maskedRef = useRef<HTMLInputElement>(null);
    const [typedRaw, setTypedRaw] = useState('');
    const pendingDigitRef = useRef<string | null>(null);

    const typingEnabled = typingMask !== undefined && parseTypedDates !== undefined;
    const isTyping = typingMode === true && typingEnabled;

    // Focus the masked input when typing mode activates
    useEffect(() => {
      if (isTyping && maskedRef.current) {
        maskedRef.current.focus();
        if (pendingDigitRef.current) {
          const digit = pendingDigitRef.current;
          pendingDigitRef.current = null;
          setTypedRaw(digit);
        }
      }
    }, [isTyping]);

    // Any calendar edit invalidates the active preset — a stale key would
    // otherwise outlive the range it named and recompute wrong dates on reload.
    const handleFromDateChange = (date: Date | null) => {
      onPresetKeyChange?.(null);
      onFromDateChange?.(date);
    };

    const handleToDateChange = (date: Date | null) => {
      onPresetKeyChange?.(null);
      onToDateChange?.(date);
    };

    // Stays open so the applied range is visible on the calendar and can be
    // adjusted from there. Opt into closing with `closeOnPresetSelect`.
    const handlePresetClick = (preset: DateRangePreset) => {
      const [from, to] = preset.getRange();
      onFromDateChange?.(from);
      onToDateChange?.(to);
      onPresetKeyChange?.(preset.key);
      // DatePicker derives its visible month from initial state only, so remount
      // it to jump the calendar to the range the preset just applied.
      openCountRef.current++;
      if (closeOnPresetSelect) setIsOpen(false);
    };

    const commitTyping = useCallback(() => {
      if (parseTypedDates && typedRaw) {
        const { from, to } = parseTypedDates(typedRaw);
        if (from || to) onPresetKeyChange?.(null);
        if (from) onFromDateChange?.(from);
        if (to) onToDateChange?.(to);
      }
      setTypedRaw('');
      onTypingModeChange?.(false);
    }, [parseTypedDates, typedRaw, onFromDateChange, onToDateChange, onTypingModeChange, onPresetKeyChange]);

    const cancelTyping = useCallback(() => {
      setTypedRaw('');
      onTypingModeChange?.(false);
    }, [onTypingModeChange]);

    const handleMaskedKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitTyping();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelTyping();
      }
    }, [commitTyping, cancelTyping]);

    const handleDisplayKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
      if (typingEnabled && e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        pendingDigitRef.current = e.key;
        setIsOpen(false);
        onTypingModeChange?.(true);
      }
    }, [typingEnabled, onTypingModeChange]);

    const formattedValue = formatRange(fromDate || null, toDate || null);
    const hasPresets = presets !== undefined && presets.length > 0;

    // Mobile lays the rail out as a horizontal strip, where a long preset list
    // scrolls out of sight. Fit as many as the width actually allows and move
    // the rest behind a "More" popover, so nothing is reachable only by
    // swiping. Desktop renders the full vertical rail, so this is inert there.
    const isNarrow = useIsNarrow(hasPresets);
    const railRef = useRef<HTMLDivElement>(null);
    const presetSignature = (presets ?? []).map((p) => p.key + p.label).join('|');
    // An explicit count opts out of measuring entirely. Only measure while the
    // popover is open, since the rail is not in the DOM otherwise.
    const measures =
      isOpen && isNarrow && hasPresets && mobilePresetCount === undefined;
    const { fitted, measuring } = useFittedCount(
      measures,
      railRef,
      presets?.length ?? 0,
      presetSignature
    );

    // While measuring, render every preset so their widths can be read.
    const overflowFrom = mobilePresetCount ?? fitted ?? presets?.length ?? 0;
    const splitPresets =
      hasPresets && isNarrow && !measuring && presets!.length > overflowFrom;
    const inlinePresets = splitPresets ? presets!.slice(0, overflowFrom) : (presets ?? []);
    const overflowPresets = splitPresets ? presets!.slice(overflowFrom) : [];
    // Surface an active-but-hidden preset on the More button itself.
    const activeOverflow = overflowPresets.find((p) => p.key === presetKey);

    const renderPreset = (preset: DateRangePreset) => (
      <button
        key={preset.key}
        type="button"
        data-preset-item=""
        className={clsx(
          'daterange-preset',
          presetKey === preset.key && 'daterange-preset-active'
        )}
        onClick={() => {
          handlePresetClick(preset);
          setMoreOpen(false);
        }}
      >
        {preset.label}
      </button>
    );

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <PopOver
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          placement="bottom"
          align="end"
          maxWidth="auto"
          maxHeight="auto"
          triggerClassName="w-full"
          trigger={
            <Input
              ref={ref}
              {...inputProps}
              value={formattedValue}
              readOnly
              onClick={() => {
                if (isTyping) return;
                openCountRef.current++;
                setIsOpen(true);
              }}
              onKeyDown={handleDisplayKeyDown}
              endIcon={endIcon}
              onEndIconClick={endIcon ? (onEndIconClick ?? (() => {
                if (isTyping) return;
                if (!isOpen) openCountRef.current++;
                setIsOpen(!isOpen);
              })) : undefined}
              style={{ cursor: 'pointer' }}
              error={error}
              size={size}
            />
          }
        >
          <div className={clsx('datepicker-popover-content', hasPresets && 'daterange-with-presets')}>
            {hasPresets && (
              <div
                ref={railRef}
                className={clsx('daterange-presets', measuring && 'daterange-presets-measuring')}
              >
                {presetsLabel !== null && (
                  <div className="daterange-presets-label">{presetsLabel ?? 'Quick ranges'}</div>
                )}
                {inlinePresets.map(renderPreset)}
                {splitPresets && (
                  <PopOver
                    isOpen={moreOpen}
                    onClose={() => setMoreOpen(false)}
                    placement="bottom"
                    align="start"
                    minWidth="150px"
                    maxWidth="auto"
                    maxHeight="auto"
                    trigger={
                      <button
                        type="button"
                        data-preset-more=""
                        className={clsx(
                          'daterange-preset',
                          'daterange-preset-more',
                          activeOverflow && 'daterange-preset-active'
                        )}
                        onClick={() => setMoreOpen(!moreOpen)}
                      >
                        {activeOverflow ? activeOverflow.label : moreLabel}
                        <Chevron direction="down" open={moreOpen} size={14} />
                      </button>
                    }
                  >
                    <div className="daterange-presets-more">
                      {overflowPresets.map(renderPreset)}
                    </div>
                  </PopOver>
                )}
              </div>
            )}
            <DatePicker
              key={openCountRef.current}
              {...datePickerProps}
              mode="range"
              fromDate={fromDate || null}
              toDate={toDate || null}
              onChange={handleFromDateChange}
              onToDateChange={handleToDateChange}
              defaultStartTime={defaultStartTime}
              defaultEndTime={defaultEndTime}
              locale={locale}
              calendar={calendar}
            />
          </div>
        </PopOver>
        {isTyping && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <MaskedInput
              ref={maskedRef}
              mask={typingMask}
              value={typedRaw}
              onChange={(raw) => setTypedRaw(raw)}
              onKeyDown={handleMaskedKeyDown}
              onBlur={commitTyping}
              placeholder={typingPlaceholder}
              error={error}
              size={size}
              style={{ width: '100%', height: '100%', background: 'var(--color-surface, #fff)' }}
            />
          </div>
        )}
      </div>
    );
  }
);

InputDateRangePicker.displayName = 'InputDateRangePicker';
