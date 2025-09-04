"use client"
import React from 'react';
import clsx from 'clsx';
import "../styles/form.css";

interface FormControlErrorProps {
  children: React.ReactElement; // Narrow down the type to React.ReactElement
  error?: {
    message?: string;
  };
}

export const FormControlError: React.FC<FormControlErrorProps> = ({ children, error }) => {
  // Ensure children is a valid React element before attempting to clone
  if (!React.isValidElement(children)) {
    console.error("FormControlError expects a single React element as children.");
    return <>{children}</>; // Render children as-is or throw an error based on desired behavior
  }

  const inputWithErrorClass = React.cloneElement(children, {
    className: clsx((children.props as any).className, { 'form-error-border': error }),
  } as any);

  return (
    <>
      {inputWithErrorClass}
      {error && <span className="form-error">{error.message}</span>}
    </>
  );
};