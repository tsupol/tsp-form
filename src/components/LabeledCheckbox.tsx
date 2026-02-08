import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { Checkbox } from './Checkbox';
import "../styles/form.css";

interface LabeledCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  wrapperClassName?: string; // For styling the div wrapping label and checkbox
}

export const LabeledCheckbox = forwardRef<HTMLInputElement, LabeledCheckboxProps>(
  ({ label, id, wrapperClassName, ...checkboxProps }, ref) => {
    const uniqueId = id || useId(); // Ensure unique ID for label htmlFor

    return (
      <div className={clsx("flex items-center gap-2", wrapperClassName)}>
        <Checkbox id={uniqueId} ref={ref} {...checkboxProps} />
        <label htmlFor={uniqueId} className="form-option-label">
          {label}
        </label>
      </div>
    );
  }
);

LabeledCheckbox.displayName = 'LabeledCheckbox';