import { forwardRef, TextareaHTMLAttributes } from "react";
import clsx from "clsx";
import "../styles/form.css";

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx("form-control", error && "form-field-error", className)}
        aria-invalid={error ? "true" : undefined}
        {...rest}
      />
    );
  }
);

TextArea.displayName = "TextArea";