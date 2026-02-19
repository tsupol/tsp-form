import { type HTMLAttributes, type ReactNode, Children, isValidElement } from 'react';
import clsx from 'clsx';
import '../styles/badge.css';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  variant?: 'solid' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  truncate?: boolean;
  className?: string;
  children?: ReactNode;
}

function getBadgeClassName(
  variant: string,
  color: string,
  size: string,
  truncate: boolean,
  className?: string,
) {
  const classes = ['badge', size !== 'md' ? `badge-${size}` : '', className];
  switch (variant) {
    case 'solid':
      classes.push(`badge-${color}`);
      break;
    case 'outline':
      classes.push(`badge-outline-${color}`);
      break;
  }
  if (truncate) {
    classes.push('badge-truncate');
  }
  return clsx(classes);
}

export const Badge = ({
  color = 'default',
  variant = 'solid',
  size = 'md',
  truncate = false,
  className,
  children,
  ...props
}: BadgeProps) => {
  const classes = getBadgeClassName(variant, color, size, truncate, className);

  if (truncate) {
    const leading: ReactNode[] = [];
    const trailing: ReactNode[] = [];
    const label: ReactNode[] = [];
    let foundText = false;

    Children.forEach(children, (child) => {
      const isIcon = isValidElement(child) && typeof child.type !== 'string';
      if (isIcon && !foundText) {
        leading.push(child);
      } else if (isIcon && foundText) {
        trailing.push(child);
      } else {
        foundText = true;
        label.push(child);
      }
    });

    return (
      <span className={classes} {...props}>
        {leading}
        <span className="badge-label">{label}</span>
        {trailing}
      </span>
    );
  }

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
