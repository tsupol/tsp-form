import { forwardRef, useState, ReactNode } from 'react';
import { Input, InputProps } from './Input';
import { PopOver } from './PopOver';
import { DatePicker, DatePickerProps } from './DatePicker';

export type InputDateRangePickerProps = Omit<InputProps, 'value' | 'onChange' | 'endIcon'> & {
  fromDate?: Date | null;
  toDate?: Date | null;
  onFromDateChange?: (date: Date | null) => void;
  onToDateChange?: (date: Date | null) => void;
  datePickerProps?: Omit<DatePickerProps, 'selectedDate' | 'fromDate' | 'toDate' | 'onChange' | 'onToDateChange' | 'mode'>;
  dateFormat?: (fromDate: Date | null, toDate: Date | null) => string;
  endIcon?: ReactNode;
  defaultStartTime?: { hours: number; minutes: number };
  defaultEndTime?: { hours: number; minutes: number };
  locale?: string;
  /** 'locale' uses the locale's native calendar (e.g. Buddhist for Thai), 'gregorian' always uses Gregorian */
  calendar?: 'locale' | 'gregorian';
  error?: boolean;
  size?: "sm" | "md" | "lg";
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
    defaultStartTime,
    defaultEndTime,
    locale = 'en-US',
    calendar = 'locale',
    error,
    size,
    ...inputProps
  }, ref) => {
    const formatRange = dateFormat ?? createDateRangeFormat(locale, calendar);
    const [isOpen, setIsOpen] = useState(false);

    const handleFromDateChange = (date: Date | null) => {
      onFromDateChange?.(date);
    };

    const handleToDateChange = (date: Date | null) => {
      onToDateChange?.(date);
    };

    const formattedValue = formatRange(fromDate || null, toDate || null);

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
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
              onClick={() => setIsOpen(true)}
              endIcon={endIcon}
              onEndIconClick={endIcon ? () => setIsOpen(!isOpen) : undefined}
              style={{ cursor: 'pointer' }}
              error={error}
              size={size}
            />
          }
        >
          <div className="datepicker-popover-content">
            <DatePicker
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
      </div>
    );
  }
);

InputDateRangePicker.displayName = 'InputDateRangePicker';
