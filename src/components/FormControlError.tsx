import { isValidElement, cloneElement, type ReactNode } from 'react';
import clsx from 'clsx';
import "../styles/form.css";

interface FormControlErrorProps {
  children: ReactNode;
  error?: {
    message?: string;
  };
}
export const FormControlError = ({ children, error }: FormControlErrorProps) => {
  if (!isValidElement(children)) {
    console.error("FormControlError expects a single React element as children.");
    return <>{children}</>;
  }

  const childProps = children.props as { className?: string };
  const enhancedChild = cloneElement(children, {
    key: "form-control-input",
    // @ts-ignore
    className: clsx(childProps.className, { 'form-error-border': error }),
  });

  return (
    <>
      {enhancedChild}
      {error && <span key="form-control-error" className="form-error">{error.message}</span>}
    </>
  );
};


