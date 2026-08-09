import { forwardRef, InputHTMLAttributes, ReactNode, useRef } from "react";
import clsx from "clsx";
import "../styles/form.css";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  error?: boolean;
  size?: "sm" | "md" | "lg";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onStartIconClick?: () => void;
  onEndIconClick?: () => void;
};

const sizeClass = (size?: "sm" | "md" | "lg") => {
  if (size === "sm") return "form-control-sm";
  if (size === "lg") return "form-control-lg";
  return undefined;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, size, startIcon, endIcon, onStartIconClick, onEndIconClick, ...rest }, ref) => {
    // The two branches below render structurally different trees, so switching
    // between them remounts the <input> and it loses focus — on iOS that folds
    // the keyboard away mid-typing. Callers legitimately toggle an icon on and
    // off (a "type 3+ characters" hint, a conditional auto-fill affordance), so
    // once this instance has shown an icon it keeps the wrapper for good, even
    // while both slots are empty. Inputs that never pass an icon still get the
    // bare element and its simpler box model.
    const hasIcons = Boolean(startIcon || endIcon);
    const everHadIcons = useRef(hasIcons);
    if (hasIcons) everHadIcons.current = true;

    if (!everHadIcons.current) {
      return (
        <input
          ref={ref}
          className={clsx("form-control", sizeClass(size), error && "form-field-error", className)}
          aria-invalid={error ? "true" : undefined}
          {...rest}
        />
      );
    }

    return (
      <div className={clsx("input-wrapper", sizeClass(size), error && "form-field-error", className)}>
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
