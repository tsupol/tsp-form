import { forwardRef, InputHTMLAttributes, useCallback, type MouseEvent } from "react";
import clsx from "clsx";
import "../styles/form.css";
import "../styles/number-spinner.css";

export type NumberSpinnerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'min' | 'max' | 'step'> & {
  error?: boolean;
  onChange?: (value: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  variant?: "default" | "diagonal";
  scale?: "xs" | "sm" | "md" | "lg";
  leadingZero?: boolean;
};

export const NumberSpinner = forwardRef<HTMLInputElement, NumberSpinnerProps>(
  ({ className, error, onChange, step = 1, min, max, value, disabled, variant = "default", scale = "md", leadingZero = false, ...rest }, ref) => {
    const handleIncrement = useCallback((e?: MouseEvent) => {
      e?.stopPropagation();

      if (disabled) return;

      const currentValue = value === "" || value === undefined || value === null ? 0 : Number(value);
      const newValue = currentValue + step;

      if (max !== undefined && newValue > Number(max)) return;

      onChange?.(newValue);
    }, [value, step, max, onChange, disabled]);

    const handleDecrement = useCallback(() => {
      if (disabled) return;

      const currentValue = value === "" || value === undefined || value === null ? 0 : Number(value);
      const newValue = currentValue - step;

      if (min !== undefined && newValue < Number(min)) return;

      onChange?.(newValue);
    }, [value, step, min, onChange, disabled]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (inputValue === "") {
        onChange?.("");
        return;
      }

      // Prevent 'e', 'E', '+', '-', '.' from being entered
      if (inputValue.includes('e') || inputValue.includes('E') || inputValue.includes('+') || inputValue.includes('-') || inputValue.includes('.')) {
        return;
      }

      const numValue = Number(inputValue);
      if (!isNaN(numValue)) {
        // Enforce max limit
        if (max !== undefined && numValue > Number(max)) {
          onChange?.(Number(max));
          return;
        }
        // Enforce min limit
        if (min !== undefined && numValue < Number(min)) {
          onChange?.(Number(min));
          return;
        }
        onChange?.(numValue);
      }
    }, [onChange, min, max]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent 'e', 'E', '+', '-', '.' from being entered
      if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-' || e.key === '.') {
        e.preventDefault();
      }
    }, []);

    const displayValue = leadingZero && value !== "" && value !== undefined && value !== null
      ? Number(value).toString().padStart(2, '0')
      : value;

    return (
      <div className={clsx(
        "number-spinner",
        `number-spinner-${variant}`,
        `number-spinner-${scale}`,
        className,
        disabled && "number-spinner-disabled",
        error && "form-field-error"
      )}>
        {variant === "default" && (
          <button
            type="button"
            className="number-spinner-btn number-spinner-btn-decrement"
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && Number(value) <= Number(min))}
            tabIndex={-1}
          >
            −
          </button>
        )}
        <input
          ref={ref}
          type="number"
          className={clsx("form-control number-spinner-input")}
          aria-invalid={error ? "true" : undefined}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          {...rest}
        />
        {variant === "default" ? (
          <button
            type="button"
            className="number-spinner-btn number-spinner-btn-increment"
            onClick={(e) => handleIncrement(e)}
            disabled={disabled || (max !== undefined && Number(value) >= Number(max))}
            tabIndex={-1}
          >
            +
          </button>
        ) : (
          <div className="number-spinner-diagonal-buttons" onClick={handleDecrement}>
            {/*<button*/}
            {/*  type="button"*/}
            {/*  className="number-spinner-btn-diagonal-decrement"*/}
            {/*  onClick={handleDecrement}*/}
            {/*  disabled={disabled || (min !== undefined && Number(value) <= Number(min))}*/}
            {/*  tabIndex={-1}*/}
            {/*/>*/}
            <button
              type="button"
              className="number-spinner-btn-diagonal-increment"
              onClick={(e) => handleIncrement(e)}
              disabled={disabled || (max !== undefined && Number(value) >= Number(max))}
              tabIndex={-1}
            />
          </div>
        )}
      </div>
    );
  }
);

NumberSpinner.displayName = "NumberSpinner";
