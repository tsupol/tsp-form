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
   * How many presets stay inline on narrow viewports before the rest move into
   * a "More" popover. Default 3. Ignored on desktop, where the full rail fits.
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
    mobilePresetCount = 3,
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
    // scrolls out of sight. Keep the first few inline and move the rest behind
    // a "More" popover so nothing is discoverable only by swiping. Desktop
    // renders the full vertical rail, so this split is inert there.
    const isNarrow = useIsNarrow(hasPresets);
    const overflowFrom = mobilePresetCount;
    const splitPresets = hasPresets && isNarrow && presets!.length > overflowFrom;
    const inlinePresets = splitPresets ? presets!.slice(0, overflowFrom) : (presets ?? []);
    const overflowPresets = splitPresets ? presets!.slice(overflowFrom) : [];
    // Surface an active-but-hidden preset on the More button itself.
    const activeOverflow = overflowPresets.find((p) => p.key === presetKey);

    const renderPreset = (preset: DateRangePreset) => (
      <button
        key={preset.key}
        type="button"
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
              <div className="daterange-presets">
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
