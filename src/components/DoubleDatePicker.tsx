'use client';

import React, { useState, useEffect } from 'react';
import '../styles/datepicker.css';
import clsx from 'clsx';

export interface DoubleDatePickerProps {
  fromDate?: Date | null;
  toDate?: Date | null;
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

export const DoubleDatePicker: React.FC<DoubleDatePickerProps> = ({
                                                                    fromDate,
                                                                    toDate,
                                                                    onChange,
                                                                    onToDateChange,
                                                                    minDate,
                                                                    maxDate,
                                                                    disabled = false,
                                                                    className
                                                                  }) => {
  // Initialize months - if fromDate exists, use its month, otherwise use current month
  const initialMonth = fromDate ? fromDate.getMonth() : new Date().getMonth();
  const initialYear = fromDate ? fromDate.getFullYear() : new Date().getFullYear();

  const [leftMonth, setLeftMonth] = useState(initialMonth);
  const [leftYear, setLeftYear] = useState(initialYear);
  const [rightMonth, setRightMonth] = useState(initialMonth === 11 ? 0 : initialMonth + 1);
  const [rightYear, setRightYear] = useState(initialMonth === 11 ? initialYear + 1 : initialYear);

  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Update left calendar when fromDate changes
  useEffect(() => {
    if (fromDate) {
      const newLeftMonth = fromDate.getMonth();
      const newLeftYear = fromDate.getFullYear();
      setLeftMonth(newLeftMonth);
      setLeftYear(newLeftYear);

      // Update right calendar to maintain at least 1 month ahead, but don't go backwards
      const currentRightDate = new Date(rightYear, rightMonth);
      const minRightDate = new Date(newLeftYear, newLeftMonth + 1);

      if (currentRightDate < minRightDate) {
        setRightMonth(newLeftMonth === 11 ? 0 : newLeftMonth + 1);
        setRightYear(newLeftMonth === 11 ? newLeftYear + 1 : newLeftYear);
      }
    }
  }, [fromDate]);

  const handleDateClick = (date: Date) => {
    if (disabled) return;

    if (!fromDate) {
      // No start date yet - set it
      if (onChange) {
        onChange(date);
      }
      if (onToDateChange) {
        onToDateChange(null);
      }
    } else if (fromDate && !toDate) {
      // Have start date but no end date - set end date
      if (date < fromDate) {
        // If clicked date is before start date, swap them
        if (onChange) {
          onChange(date);
        }
        if (onToDateChange) {
          onToDateChange(fromDate);
        }
      } else {
        // Normal case: set end date
        if (onToDateChange) {
          onToDateChange(date);
        }
      }
    } else if (fromDate && toDate) {
      // Both dates are set - update the end date with new selection
      if (date < fromDate) {
        // If clicked date is before start date, swap them
        if (onChange) {
          onChange(date);
        }
        if (onToDateChange) {
          onToDateChange(fromDate);
        }
      } else {
        // Update end date
        if (onToDateChange) {
          onToDateChange(date);
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
    return (fromDate && isSameDay(date, fromDate)) ||
      (toDate && isSameDay(date, toDate)) || false;
  };

  const isDateInRange = (date: Date): boolean => {
    if (fromDate && toDate) {
      return date > fromDate && date < toDate;
    }

    if (fromDate && hoverDate && !toDate) {
      const rangeStart = fromDate < hoverDate ? fromDate : hoverDate;
      const rangeEnd = fromDate < hoverDate ? hoverDate : fromDate;
      return date > rangeStart && date < rangeEnd;
    }

    return false;
  };

  const isRangeStart = (date: Date): boolean => {
    return fromDate ? isSameDay(date, fromDate) : false;
  };

  const isRangeEnd = (date: Date): boolean => {
    return toDate ? isSameDay(date, toDate) : false;
  };

  const renderCalendar = (month: number, year: number, isLeft: boolean) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="datepicker-day-empty" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
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
          onMouseEnter={() => !disabled && setHoverDate(date)}
          onMouseLeave={() => setHoverDate(null)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const navigateLeft = (direction: 'prev' | 'next') => {
    if (disabled) return;

    if (direction === 'prev') {
      // Calculate minimum allowed month based on fromDate
      const minAllowedMonth = fromDate ? fromDate.getMonth() : 0;
      const minAllowedYear = fromDate ? fromDate.getFullYear() : 0;

      const newMonth = leftMonth === 0 ? 11 : leftMonth - 1;
      const newYear = leftMonth === 0 ? leftYear - 1 : leftYear;

      // Don't allow navigation before the fromDate month
      if (fromDate &&
        (newYear < minAllowedYear ||
          (newYear === minAllowedYear && newMonth < minAllowedMonth))) {
        return;
      }

      setLeftMonth(newMonth);
      setLeftYear(newYear);
    } else {
      if (leftMonth === 11) {
        setLeftMonth(0);
        setLeftYear(leftYear + 1);
      } else {
        setLeftMonth(leftMonth + 1);
      }
    }
  };

  const navigateRight = (direction: 'prev' | 'next') => {
    if (disabled) return;

    if (direction === 'prev') {
      // Don't allow right calendar to go before left + 1
      const newMonth = rightMonth === 0 ? 11 : rightMonth - 1;
      const newYear = rightMonth === 0 ? rightYear - 1 : rightYear;

      const minAllowedMonth = leftMonth === 11 ? 0 : leftMonth + 1;
      const minAllowedYear = leftMonth === 11 ? leftYear + 1 : leftYear;

      if (newYear < minAllowedYear ||
        (newYear === minAllowedYear && newMonth < minAllowedMonth)) {
        return;
      }

      setRightMonth(newMonth);
      setRightYear(newYear);
    } else {
      if (rightMonth === 11) {
        setRightMonth(0);
        setRightYear(rightYear + 1);
      } else {
        setRightMonth(rightMonth + 1);
      }
    }
  };

  const canNavigateLeftPrev = () => {
    if (!fromDate) return true;

    const newMonth = leftMonth === 0 ? 11 : leftMonth - 1;
    const newYear = leftMonth === 0 ? leftYear - 1 : leftYear;

    return !(newYear < fromDate.getFullYear() ||
      (newYear === fromDate.getFullYear() && newMonth < fromDate.getMonth()));
  };

  const canNavigateRightPrev = () => {
    const newMonth = rightMonth === 0 ? 11 : rightMonth - 1;
    const newYear = rightMonth === 0 ? rightYear - 1 : rightYear;

    const minAllowedMonth = leftMonth === 11 ? 0 : leftMonth + 1;
    const minAllowedYear = leftMonth === 11 ? leftYear + 1 : leftYear;

    return !(newYear < minAllowedYear ||
      (newYear === minAllowedYear && newMonth < minAllowedMonth));
  };

  return (
    <div className={clsx('flex gap-4', { 'opacity-50': disabled }, className)}>
      {/* Left Calendar */}
      <div className="datepicker-container">
        <div className="datepicker-header">
          <button
            type="button"
            className="datepicker-nav-button"
            onClick={() => navigateLeft('prev')}
            disabled={disabled || !canNavigateLeftPrev()}
          >
            ←
          </button>
          <div className="datepicker-month-year">
            {MONTHS[leftMonth]} {leftYear}
          </div>
          <button
            type="button"
            className="datepicker-nav-button"
            onClick={() => navigateLeft('next')}
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
          {renderCalendar(leftMonth, leftYear, true)}
        </div>
      </div>

      {/* Right Calendar */}
      <div className="datepicker-container">
        <div className="datepicker-header">
          <button
            type="button"
            className="datepicker-nav-button"
            onClick={() => navigateRight('prev')}
            disabled={disabled || !canNavigateRightPrev()}
          >
            ←
          </button>
          <div className="datepicker-month-year">
            {MONTHS[rightMonth]} {rightYear}
          </div>
          <button
            type="button"
            className="datepicker-nav-button"
            onClick={() => navigateRight('next')}
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
          {renderCalendar(rightMonth, rightYear, false)}
        </div>
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