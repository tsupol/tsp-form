import { useState } from 'react';
import '../styles/datepicker.css';
import clsx from 'clsx';

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
  className
}: DatePickerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

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
        onChange(date);
      }
    } else {
      // Range mode
      if (!startDate) {
        // No start date yet - set it
        if (onChange) {
          onChange(date);
        }
        if (onToDateChange) {
          onToDateChange(null);
        }
      } else if (startDate && !endDate) {
        // Have start date but no end date - set end date
        if (date < startDate) {
          // If clicked date is before start date, swap them
          if (onChange) {
            onChange(date);
          }
          if (onToDateChange) {
            onToDateChange(startDate);
          }
        } else {
          // Normal case: set end date
          if (onToDateChange) {
            onToDateChange(date);
          }
        }
      } else if (startDate && endDate) {
        // Both dates are set - update the end date with new selection
        if (date < startDate) {
          // If clicked date is before start date, swap them
          if (onChange) {
            onChange(date);
          }
          if (onToDateChange) {
            onToDateChange(startDate);
          }
        } else {
          // Update end date
          if (onToDateChange) {
            onToDateChange(date);
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

  return (
    <div className={clsx('datepicker-container', { 'opacity-50': disabled }, className)}>
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