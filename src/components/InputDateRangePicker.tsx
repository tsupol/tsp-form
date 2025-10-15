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
};

const defaultDateRangeFormat = (fromDate: Date | null, toDate: Date | null): string => {
  if (!fromDate && !toDate) return '';

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

export const InputDateRangePicker = forwardRef<HTMLInputElement, InputDateRangePickerProps>(
  ({
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
    datePickerProps,
    dateFormat = defaultDateRangeFormat,
    endIcon,
    defaultStartTime,
    defaultEndTime,
    ...inputProps
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleFromDateChange = (date: Date | null) => {
      onFromDateChange?.(date);
    };

    const handleToDateChange = (date: Date | null) => {
      onToDateChange?.(date);
      if (date !== null) {
        setIsOpen(false);
      }
    };

    const formattedValue = dateFormat(fromDate || null, toDate || null);

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <PopOver
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          placement="bottom"
          align="end"
          maxWidth="auto"
          maxHeight="auto"
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
            />
          }
        >
          <div className="flex">
            <DatePicker
              {...datePickerProps}
              mode="range"
              fromDate={fromDate || null}
              toDate={toDate || null}
              onChange={handleFromDateChange}
              onToDateChange={handleToDateChange}
              defaultStartTime={defaultStartTime}
              defaultEndTime={defaultEndTime}
            />
          </div>
        </PopOver>
      </div>
    );
  }
);

InputDateRangePicker.displayName = 'InputDateRangePicker';
