import { forwardRef, useState, useRef, useEffect, useCallback, ReactNode, KeyboardEvent } from 'react';
import { Input, InputProps } from './Input';
import { MaskedInput } from './MaskedInput';
import { PopOver } from './PopOver';
import { DatePicker, DatePickerProps } from './DatePicker';

export type InputDatePickerProps = Omit<InputProps, 'value' | 'onChange' | 'endIcon' | 'onEndIconClick'> & {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  datePickerProps?: Omit<DatePickerProps, 'selectedDate' | 'onChange' | 'mode'>;
  dateFormat?: (date: Date | null) => string;
  endIcon?: ReactNode;
  defaultStartTime?: { hours: number; minutes: number };
  locale?: string;
  /** 'locale' uses the locale's native calendar (e.g. Buddhist for Thai), 'gregorian' always uses Gregorian */
  calendar?: 'locale' | 'gregorian';
  error?: boolean;
  size?: "sm" | "md" | "lg";
  /** Controlled typing mode — when true, shows a MaskedInput overlay for keyboard date entry */
  typingMode?: boolean;
  /** Called when typing mode should change (e.g. user presses a digit, or finishes typing) */
  onTypingModeChange?: (typing: boolean) => void;
  /** Mask pattern for typing mode (e.g. '##/##/####') */
  typingMask?: string;
  /** Parse the raw digits from the mask into a Date. Return null if invalid. */
  parseTypedDate?: (rawDigits: string) => Date | null;
};

function resolveLocale(locale: string, calendar: 'locale' | 'gregorian'): string {
  return calendar === 'gregorian' ? `${locale}-u-ca-gregory` : locale;
}

const createDateFormat = (locale: string, calendar: 'locale' | 'gregorian') => {
  const resolved = resolveLocale(locale, calendar);
  return (date: Date | null): string => {
    if (!date) return '';
    const showTime = date.getHours() !== 0 || date.getMinutes() !== 0;
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(showTime && { hour: 'numeric', minute: '2-digit' }),
    };
    return date.toLocaleString(resolved, opts);
  };
};

export const InputDatePicker = forwardRef<HTMLInputElement, InputDatePickerProps>(
  ({
    value, onChange, datePickerProps, dateFormat, endIcon, onEndIconClick, defaultStartTime,
    locale = 'en-US', calendar = 'locale', error, size,
    typingMode, onTypingModeChange, typingMask, parseTypedDate,
    ...inputProps
  }, ref) => {
    const formatDate = dateFormat ?? createDateFormat(locale, calendar);
    const [isOpen, setIsOpen] = useState(false);
    const openCountRef = useRef(0);
    const maskedRef = useRef<HTMLInputElement>(null);
    const [typedRaw, setTypedRaw] = useState('');
    const pendingDigitRef = useRef<string | null>(null);

    const typingEnabled = typingMask !== undefined && parseTypedDate !== undefined;
    const isTyping = typingMode === true && typingEnabled;

    // Focus the masked input when typing mode activates
    useEffect(() => {
      if (isTyping && maskedRef.current) {
        maskedRef.current.focus();
        // If there's a pending digit from the keydown that triggered typing mode,
        // simulate typing it into the masked input
        if (pendingDigitRef.current) {
          const digit = pendingDigitRef.current;
          pendingDigitRef.current = null;
          setTypedRaw(digit);
        }
      }
    }, [isTyping]);

    const handleDateChange = (date: Date | null) => {
      onChange?.(date);
    };

    const commitTyping = useCallback(() => {
      if (parseTypedDate && typedRaw) {
        const parsed = parseTypedDate(typedRaw);
        if (parsed) {
          onChange?.(parsed);
        }
      }
      setTypedRaw('');
      onTypingModeChange?.(false);
    }, [parseTypedDate, typedRaw, onChange, onTypingModeChange]);

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

    const formattedValue = formatDate(value || null);

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
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
        {isTyping && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <MaskedInput
              ref={maskedRef}
              mask={typingMask}
              value={typedRaw}
              onChange={(raw) => setTypedRaw(raw)}
              onKeyDown={handleMaskedKeyDown}
              onBlur={commitTyping}
              error={error}
              size={size}
              style={{ width: '100%', height: '100%', background: 'var(--color-surface, #fff)' }}
            />
          </div>
        )}
        <PopOver
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          placement="bottom"
          align="end"
          maxWidth="auto"
          maxHeight="auto"
        >
          <div className="datepicker-popover-content">
            <DatePicker
              key={openCountRef.current}
              {...datePickerProps}
              selectedDate={value || null}
              onChange={handleDateChange}
              defaultStartTime={defaultStartTime}
              locale={locale}
              calendar={calendar}
            />
          </div>
        </PopOver>
      </div>
    );
  }
);

InputDatePicker.displayName = 'InputDatePicker';
