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
  /**
   * Render the icon wrapper even while both slots are empty.
   *
   * Set this when the icons are CONDITIONAL and the field can start with none —
   * a "type N more characters" hint, a clear-X that appears once there is text,
   * a validation mark. Without it the first icon to appear changes the DOM
   * shape, which remounts the <input>: focus is lost, and on iOS the keyboard
   * folds away and reverts from numeric to letters mid-word.
   *
   * Unnecessary when a permanent icon is present (e.g. a search magnifier) —
   * the wrapper is already there and never goes away.
   */
  reserveIconSlots?: boolean;
};

const sizeClass = (size?: "sm" | "md" | "lg") => {
  if (size === "sm") return "form-control-sm";
  if (size === "lg") return "form-control-lg";
  return undefined;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, size, startIcon, endIcon, onStartIconClick, onEndIconClick, reserveIconSlots, ...rest }, ref) => {
    // The two branches below render structurally different trees, so switching
    // between them remounts the <input> and it loses focus — on iOS that folds
    // the keyboard away mid-typing.
    //
    // `everHadIcons` keeps the wrapper once an icon has been shown, which covers
    // a field that starts WITH an icon and later drops it. It cannot help a
    // field that starts with none: the first icon to appear is still a shape
    // change, and that is the transition users actually hit (typing character 1
    // into a search box whose only icon is a min-length hint). `reserveIconSlots`
    // is the fix for that case — the caller declares up front that its icons are
    // conditional, and the wrapper is present from the very first render.
    //
    // Inputs that never pass an icon and don't opt in still get the bare
    // element and its simpler box model.
    const hasIcons = Boolean(startIcon || endIcon);
    const everHadIcons = useRef(hasIcons);
    if (hasIcons) everHadIcons.current = true;

    if (!reserveIconSlots && !everHadIcons.current) {
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
