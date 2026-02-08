import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import "../styles/switch.css";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  size?: "sm" | "md" | "lg";
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, id, size = "md", disabled, ...props }, ref) => {
    const uniqueId = id || useId();

    return (
      <label
        htmlFor={uniqueId}
        className={clsx(
          "switch",
          `switch-${size}`,
          disabled && "switch-disabled",
          className
        )}
      >
        <input
          id={uniqueId}
          ref={ref}
          type="checkbox"
          className="switch-input"
          disabled={disabled}
          {...props}
        />
        <span className="switch-slider" />
      </label>
    );
  }
);

Switch.displayName = 'Switch';
