import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import "../styles/form.css";
import "../styles/button.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  variant?: string;
  size?: string;
  truncate?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
}

function getClassName(variant: string, color: string, size: string, iconOnly: boolean, disabled?: boolean, truncate?: boolean, className?: string) {
  const classes = ['btn', size !== 'md' ? `btn-${size}` : '', iconOnly && 'btn-icon-only', truncate && 'btn-truncate', className];
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
      truncate,
      startIcon,
      endIcon,
      className,
      disabled,
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    const iconOnly = !children && !!(startIcon || endIcon);
    const classes = getClassName(variant, color, size, iconOnly, disabled, truncate, className);

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled}
        {...props}
      >
        {startIcon && <span className="btn-icon-slot">{startIcon}</span>}
        <span className="btn-content">{children}</span>
        {endIcon && <span className="btn-icon-slot">{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
