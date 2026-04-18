import { forwardRef, useState, useRef, useEffect, useCallback, ReactNode, KeyboardEvent } from 'react';
import { Input, InputProps } from './Input';
import { MaskedInput } from './MaskedInput';
import { PopOver } from './PopOver';
import { DatePicker, DatePickerProps } from './DatePicker';

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
};

const hasTime = (date: Date | null) =>
  date !== null && (date.getHours() !== 0 || date.getMinutes() !== 0);

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
    ...inputProps
  }, ref) => {
    const formatRange = dateFormat ?? createDateRangeFormat(locale, calendar);
    const [isOpen, setIsOpen] = useState(false);
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

    const handleFromDateChange = (date: Date | null) => {
      onFromDateChange?.(date);
    };

    const handleToDateChange = (date: Date | null) => {
      onToDateChange?.(date);
    };

    const commitTyping = useCallback(() => {
      if (parseTypedDates && typedRaw) {
        const { from, to } = parseTypedDates(typedRaw);
        if (from) onFromDateChange?.(from);
        if (to) onToDateChange?.(to);
      }
      setTypedRaw('');
      onTypingModeChange?.(false);
    }, [parseTypedDates, typedRaw, onFromDateChange, onToDateChange, onTypingModeChange]);

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
          <div className="datepicker-popover-content">
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
