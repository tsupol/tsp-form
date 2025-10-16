import { forwardRef, useState, ReactNode, useRef } from 'react';
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
};

const defaultDateFormat = (date: Date | null): string => {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const InputDatePicker = forwardRef<HTMLInputElement, InputDatePickerProps>(
  ({ value, onChange, datePickerProps, dateFormat = defaultDateFormat, endIcon, defaultStartTime, ...inputProps }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const openDateRef = useRef<Date | null>(null);

    const handleDateChange = (date: Date | null) => {
      onChange?.(date);

      // Only close the popover if the date day has actually changed (not just time)
      // This prevents closing when adjusting time with keyboard or when clicking inside
      const openDate = openDateRef.current;

      // Check if the actual date (day/month/year) has changed
      const isSameDate = openDate && date &&
        openDate.getDate() === date.getDate() &&
        openDate.getMonth() === date.getMonth() &&
        openDate.getFullYear() === date.getFullYear();

      // Only close if a different day was selected
      if (!isSameDate && date) {
        setIsOpen(false);
      }
    };

    const formattedValue = dateFormat(value || null);

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Input
          ref={ref}
          {...inputProps}
          value={formattedValue}
          readOnly
          onClick={() => {
            openDateRef.current = value;
            setIsOpen(true);
          }}
          endIcon={endIcon}
          onEndIconClick={endIcon ? () => {
            openDateRef.current = value;
            setIsOpen(!isOpen);
          } : undefined}
          style={{ cursor: 'pointer' }}
        />
        <PopOver
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          placement="bottom"
          align="end"
          maxWidth="auto"
          maxHeight="auto"
        >
          <div className="flex">
            <DatePicker
              {...datePickerProps}
              selectedDate={value || null}
              onChange={handleDateChange}
              defaultStartTime={defaultStartTime}
            />
          </div>
        </PopOver>
      </div>
    );
  }
);

InputDatePicker.displayName = 'InputDatePicker';
