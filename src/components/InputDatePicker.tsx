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
    // const triggerRef = useRef<HTMLDivElement>(null);

    const handleDateChange = (date: Date | null) => {
      onChange?.(date);
      setIsOpen(false);
    };

    const formattedValue = dateFormat(value || null);

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
