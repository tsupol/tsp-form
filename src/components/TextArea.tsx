import { forwardRef, TextareaHTMLAttributes } from "react";
import clsx from "clsx";
import "../styles/form.css";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClass = (size?: "sm" | "md" | "lg") => {
  if (size === "sm") return "form-control-sm";
  if (size === "lg") return "form-control-lg";
  return undefined;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, size, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx("form-control", sizeClass(size), error && "form-field-error", className)}
        aria-invalid={error ? "true" : undefined}
        {...rest}
      />
    );
  }
);

TextArea.displayName = "TextArea";