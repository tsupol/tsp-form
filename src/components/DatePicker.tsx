import { useState } from 'react';
import '../styles/datepicker.css';
import clsx from 'clsx';
import { Button } from './Button';
import { NumberSpinner } from './NumberSpinner';

export interface DatePickerProps {
  mode?: 'single' | 'range';
  selectedDate?: Date | null;
  toDate?: Date | null;
  fromDate?: Date | null;
  onChange?: (date: Date | null) => void;
  onToDateChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DatePicker = ({
  mode = 'single',
  selectedDate,
  toDate,
  fromDate,
  onChange,
  onToDateChange,
  minDate,
  maxDate,
  disabled = false,
  className,
  showTime = false,
  timeFormat = '24h'
}: DatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Time state for single mode or range start
  const [startHours, setStartHours] = useState(0);
  const [startMinutes, setStartMinutes] = useState(0);

  // Time state for range end
  const [endHours, setEndHours] = useState(23);
  const [endMinutes, setEndMinutes] = useState(59);

  // Get the start date for the component
  const getStartDate = (): Date | null => {
    if (mode === 'single') {
      return selectedDate || fromDate || null;
    } else {
      return selectedDate || fromDate || null;
    }
  };

  // Get the end date for the component
  const getEndDate = (): Date | null => {
    if (mode === 'single') {
      return null;
    } else {
      return toDate || null;
    }
  };

  const startDate = getStartDate();
  const endDate = getEndDate();

  const handleDateClick = (date: Date) => {
    if (disabled) return;

    if (mode === 'single') {
      if (onChange) {
        const dateWithTime = showTime
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHours, startMinutes)
          : date;
        onChange(dateWithTime);
      }
    } else {
      // Range mode
      if (!startDate) {
        // No start date yet - set it
        if (onChange) {
          const dateWithTime = showTime
            ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHours, startMinutes)
            : date;
          onChange(dateWithTime);
        }
        if (onToDateChange) {
          onToDateChange(null);
        }
      } else if (startDate && !endDate) {
        // Have start date but no end date - set end date
        if (date < startDate) {
          // If clicked date is before start date, swap them
          if (onChange) {
            const dateWithTime = showTime
              ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHours, startMinutes)
              : date;
            onChange(dateWithTime);
          }
          if (onToDateChange) {
            const endDateWithTime = showTime
              ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), endHours, endMinutes)
              : startDate;
            onToDateChange(endDateWithTime);
          }
        } else {
          // Normal case: set end date
          if (onToDateChange) {
            const dateWithTime = showTime
              ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHours, endMinutes)
              : date;
            onToDateChange(dateWithTime);
          }
        }
      } else if (startDate && endDate) {
        // Both dates are set - update the end date with new selection
        if (date < startDate) {
          // If clicked date is before start date, swap them
          if (onChange) {
            const dateWithTime = showTime
              ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHours, startMinutes)
              : date;
            onChange(dateWithTime);
          }
          if (onToDateChange) {
            const endDateWithTime = showTime
              ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), endHours, endMinutes)
              : startDate;
            onToDateChange(endDateWithTime);
          }
        } else {
          // Update end date
          if (onToDateChange) {
            const dateWithTime = showTime
              ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHours, endMinutes)
              : date;
            onToDateChange(dateWithTime);
          }
        }
      }
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateSelected = (date: Date): boolean => {
    if (mode === 'single') {
      return startDate ? isSameDay(date, startDate) : false;
    } else {
      return (startDate && isSameDay(date, startDate)) ||
        (endDate && isSameDay(date, endDate)) || false;
    }
  };

  const isDateInRange = (date: Date): boolean => {
    if (mode === 'single') return false;

    if (startDate && endDate) {
      return date > startDate && date < endDate;
    }

    if (startDate && hoverDate && !endDate) {
      const rangeStart = startDate < hoverDate ? startDate : hoverDate;
      const rangeEnd = startDate < hoverDate ? hoverDate : startDate;
      return date > rangeStart && date < rangeEnd;
    }

    return false;
  };

  const isRangeStart = (date: Date): boolean => {
    if (mode === 'single') return false;
    return startDate ? isSameDay(date, startDate) : false;
  };

  const isRangeEnd = (date: Date): boolean => {
    if (mode === 'single') return false;
    return endDate ? isSameDay(date, endDate) : false;
  };

  const renderCalendar = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="datepicker-day-empty"/>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isDisabled = isDateDisabled(date);
      const isSelected = isDateSelected(date);
      const inRange = isDateInRange(date);
      const rangeStart = isRangeStart(date);
      const rangeEnd = isRangeEnd(date);

      days.push(
        <div
          key={day}
          className={clsx('datepicker-day', {
            'datepicker-day-selected': isSelected,
            'datepicker-day-disabled': isDisabled,
            'datepicker-day-in-range': inRange,
            'datepicker-day-range-start': rangeStart,
            'datepicker-day-range-end': rangeEnd,
          })}
          onClick={() => !isDisabled && handleDateClick(date)}
          onMouseEnter={() => mode === 'range' && !disabled && setHoverDate(date)}
          onMouseLeave={() => mode === 'range' && setHoverDate(null)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (disabled) return;

    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleClear = () => {
    if (disabled) return;
    if (onChange) onChange(null);
    if (onToDateChange) onToDateChange(null);
  };

  const handleToday = () => {
    if (disabled) return;
    const today = new Date();
    const todayWithTime = showTime
      ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHours, startMinutes)
      : today;

    if (onChange) onChange(todayWithTime);
    if (mode === 'range' && onToDateChange) {
      onToDateChange(null);
    }

    // Navigate to current month
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handleTimeChange = (type: 'start' | 'end', field: 'hours' | 'minutes', value: number) => {
    if (type === 'start') {
      if (field === 'hours') {
        setStartHours(value);
        if (mode === 'single' && startDate && onChange) {
          onChange(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), value, startMinutes));
        } else if (mode === 'range' && startDate && onChange) {
          onChange(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), value, startMinutes));
        }
      } else {
        setStartMinutes(value);
        if (mode === 'single' && startDate && onChange) {
          onChange(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startHours, value));
        } else if (mode === 'range' && startDate && onChange) {
          onChange(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startHours, value));
        }
      }
    } else {
      if (field === 'hours') {
        setEndHours(value);
        if (endDate && onToDateChange) {
          onToDateChange(new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), value, endMinutes));
        }
      } else {
        setEndMinutes(value);
        if (endDate && onToDateChange) {
          onToDateChange(new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), endHours, value));
        }
      }
    }
  };

  return (
    <div className={clsx('datepicker-wrapper', { 'opacity-50': disabled }, className)}>
      <div className="datepicker-container">
        <div className="datepicker-header">
          <button
            type="button"
            className="datepicker-nav-button"
            onClick={() => navigateMonth('prev')}
            disabled={disabled}
          >
            ←
          </button>
          <div className="datepicker-month-year">
            {MONTHS[currentMonth]} {currentYear}
          </div>
          <button
            type="button"
            className="datepicker-nav-button"
            onClick={() => navigateMonth('next')}
            disabled={disabled}
          >
            →
          </button>
        </div>
        <div className="datepicker-weekdays">
          {WEEKDAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="datepicker-days-container">
          {renderCalendar()}
        </div>
        <div className="datepicker-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
          >
            Clear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            disabled={disabled}
          >
            Today
          </Button>
        </div>
      </div>

      {showTime && (
        <div className="datepicker-time-container">
          <div className="datepicker-time-section">
            <div className="datepicker-time-label">
              {mode === 'range' ? 'Start Time' : 'Time'}
            </div>
            <TimeInput
              hours={startHours}
              minutes={startMinutes}
              onChange={(field, value) => handleTimeChange('start', field, value)}
              disabled={disabled}
              format={timeFormat}
            />
          </div>

          {mode === 'range' && (
            <div className="datepicker-time-section">
              <div className="datepicker-time-label">End Time</div>
              <TimeInput
                hours={endHours}
                minutes={endMinutes}
                onChange={(field, value) => handleTimeChange('end', field, value)}
                disabled={disabled}
                format={timeFormat}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TimeInputProps {
  hours: number;
  minutes: number;
  onChange: (field: 'hours' | 'minutes', value: number) => void;
  disabled?: boolean;
  format: '12h' | '24h';
}

const TimeInput = ({ hours, minutes, onChange, disabled, format }: TimeInputProps) => {
  const is12Hour = format === '12h';
  const displayHours = is12Hour ? (hours % 12 || 12) : hours;
  const period = hours >= 12 ? 'PM' : 'AM';

  const handleHoursChange = (value: number | "") => {
    if (value === "") return;

    if (is12Hour) {
      const newHours = period === 'PM' ? (value === 12 ? 12 : value + 12) : (value === 12 ? 0 : value);
      onChange('hours', newHours);
    } else {
      onChange('hours', value);
    }
  };

  const handleMinutesChange = (value: number | "") => {
    if (value === "") return;
    onChange('minutes', value);
  };

  const togglePeriod = () => {
    if (is12Hour) {
      const newHours = hours >= 12 ? hours - 12 : hours + 12;
      onChange('hours', newHours);
    }
  };

  return (
    <div className="datepicker-time-input">
      <div className="datepicker-time-row">
        <NumberSpinner
          value={displayHours}
          onChange={handleHoursChange}
          disabled={disabled}
          min={is12Hour ? 1 : 0}
          max={is12Hour ? 12 : 23}
          size="sm"
        />
        {is12Hour && (
          <button
            type="button"
            onClick={togglePeriod}
            disabled={disabled}
            className="datepicker-time-period"
          >
            {period}
          </button>
        )}
      </div>
      <div className="datepicker-time-row">
        <NumberSpinner
          value={minutes}
          onChange={handleMinutesChange}
          disabled={disabled}
          min={0}
          max={59}
          size="sm"
        />
      </div>
    </div>
  );
};

function isSameDay(date1: Date, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) return false;

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}