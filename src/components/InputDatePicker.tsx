import { forwardRef, useState, ReactNode } from 'react';
import { Input, InputProps } from './Input';
import { PopOver } from './PopOver';
import { DatePicker, DatePickerProps } from './DatePicker';

export type InputDatePickerProps = Omit<InputProps, 'value' | 'onChange' | 'endIcon'> & {
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
  ({ value, onChange, datePickerProps, dateFormat, endIcon, defaultStartTime, locale = 'en-US', calendar = 'locale', error, size, ...inputProps }, ref) => {
    const formatDate = dateFormat ?? createDateFormat(locale, calendar);
    const [isOpen, setIsOpen] = useState(false);

    const handleDateChange = (date: Date | null) => {
      onChange?.(date);
    };

    const formattedValue = formatDate(value || null);

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Input
          ref={ref}
          {...inputProps}
          value={formattedValue}
          readOnly
          onClick={() => setIsOpen(true)}
          endIcon={endIcon}
          onEndIconClick={endIcon ? () => setIsOpen(!isOpen) : undefined}
          style={{ cursor: 'pointer' }}
          error={error}
          size={size}
        />
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
