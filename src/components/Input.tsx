import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import "../styles/form.css";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onStartIconClick?: () => void;
  onEndIconClick?: () => void;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, startIcon, endIcon, onStartIconClick, onEndIconClick, ...rest }, ref) => {
    if (!startIcon && !endIcon) {
      return (
        <input
          ref={ref}
          className={clsx("form-control", className)}
          aria-invalid={error ? "true" : undefined}
          {...rest}
        />
      );
    }

    return (
      <div className={clsx("input-wrapper", className)}>
        {startIcon && (
          <div
            className={clsx("input-icon input-icon-start", onStartIconClick && "input-icon-clickable")}
            onClick={onStartIconClick}
          >
            {startIcon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            "form-control",
            "input-with-icon",
            startIcon && "input-has-start-icon",
            endIcon && "input-has-end-icon"
          )}
          aria-invalid={error ? "true" : undefined}
          {...rest}
        />
        {endIcon && (
          <div
            className={clsx("input-icon input-icon-end", onEndIconClick && "input-icon-clickable")}
            onClick={onEndIconClick}
          >
            {endIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
