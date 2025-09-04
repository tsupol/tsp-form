'use client';
import React, { forwardRef, InputHTMLAttributes } from "react";
import clsx from "clsx";
import "../styles/form.css";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...rest }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx("form-control", className)}
        aria-invalid={error ? "true" : undefined}
        {...rest}
      />
    );
  }
);

Input.displayName = "Input";
