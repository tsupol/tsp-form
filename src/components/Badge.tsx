import { type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import '../styles/badge.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  variant?: 'solid' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  truncate?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

function getBadgeClassName(
  variant: string,
  color: string,
  size: string,
  iconOnly: boolean,
  truncate: boolean,
  className?: string,
) {
  const classes = ['badge', size !== 'md' ? `badge-${size}` : '', iconOnly && 'badge-icon-only', truncate && 'badge-truncate', className];
  switch (variant) {
    case 'solid':
      classes.push(`badge-${color}`);
      break;
    case 'outline':
      classes.push(`badge-outline-${color}`);
      break;
  }
  return clsx(classes);
}

export const Badge = ({
  color = 'default',
  variant = 'solid',
  size = 'md',
  truncate = false,
  startIcon,
  endIcon,
  className,
  children,
  ...props
}: BadgeProps) => {
  const iconOnly = !children && !!(startIcon || endIcon);
  const classes = getBadgeClassName(variant, color, size, iconOnly, truncate, className);

  return (
    <span className={classes} {...props}>
      {startIcon && <span className="badge-icon-slot">{startIcon}</span>}
      <span className={truncate ? 'badge-label' : 'badge-content'}>{children}</span>
      {endIcon && <span className="badge-icon-slot">{endIcon}</span>}
    </span>
  );
};

Badge.displayName = 'Badge';
