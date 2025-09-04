"use client"
import React, { forwardRef } from "react";
import clsx from "clsx";
import "../styles/form.css";
import "../styles/button.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  variant?: string;
  size?: string;
  className?: string;
}

function getClassName(variant: string, color: string, size: string, disabled?: boolean, className?: string, ) {
  const classes = ['btn', `btn-${size}`, className];
  switch (variant) {
    case 'solid':
      classes.push(`btn-${color}`);
      break;
    case 'outline':
      classes.push(`btn-outline-${color}`);
      break;
    case 'ghost':
      classes.push(`btn-ghost-${color}`);
      break;
    default:
      break;
  }
  if (disabled) {
    classes.push('disabled');
  }
  return clsx(classes);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      color = "default",
      variant = "solid",
      size = "md",
      className,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    const classes = getClassName(variant, color, size, disabled, className);

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";