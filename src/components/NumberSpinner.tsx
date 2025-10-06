import { forwardRef, InputHTMLAttributes, useCallback, type MouseEvent } from "react";
import clsx from "clsx";
import "../styles/form.css";
import "../styles/number-spinner.css";

export type NumberSpinnerProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  error?: boolean;
  onChange?: (value: number | "") => void;
  step?: number;
  variant?: "default" | "diagonal";
};

export const NumberSpinner = forwardRef<HTMLInputElement, NumberSpinnerProps>(
  ({ className, error, onChange, step = 1, min, max, value, disabled, variant = "default", ...rest }, ref) => {
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

      const numValue = Number(inputValue);
      if (!isNaN(numValue)) {
        onChange?.(numValue);
      }
    }, [onChange]);

    return (
      <div className={clsx(
        "number-spinner",
        `number-spinner-${variant}`,
        className,
        disabled && "number-spinner-disabled"
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
          value={value}
          onChange={handleInputChange}
          step={step}
          min={min}
          max={max}
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
