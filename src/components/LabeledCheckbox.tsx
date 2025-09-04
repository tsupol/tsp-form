"use client"
import React from 'react';
import clsx from 'clsx';
import { Checkbox } from './Checkbox';
import "../styles/form.css";

interface LabeledCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  wrapperClassName?: string; // For styling the div wrapping label and checkbox
}

export const LabeledCheckbox = React.forwardRef<HTMLInputElement, LabeledCheckboxProps>(
  ({ label, id, wrapperClassName, ...checkboxProps }, ref) => {
    const uniqueId = id || React.useId(); // Ensure unique ID for label htmlFor

    return (
      <div className={clsx("flex items-center gap-2", wrapperClassName)}>
        <Checkbox id={uniqueId} ref={ref} {...checkboxProps} />
        <label htmlFor={uniqueId} className="cursor-pointer select-none">
          {label}
        </label>
      </div>
    );
  }
);

LabeledCheckbox.displayName = 'LabeledCheckbox';