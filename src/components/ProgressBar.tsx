import { HTMLAttributes } from 'react';
import clsx from 'clsx';
import '../styles/progress-bar.css';

export type ProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  value: number;
  max?: number;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  striped?: boolean;
};

export const ProgressBar = ({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  label,
  animated = false,
  striped = false,
  className,
  ...rest
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div
      className={clsx('progress-bar', `progress-bar-${size}`, className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || `${percentage}% complete`}
      {...rest}
    >
      <div
        className={clsx(
          'progress-bar-fill',
          `progress-bar-fill-${color}`,
          striped && 'progress-bar-striped',
          animated && 'progress-bar-animated'
        )}
        style={{ width: `${percentage}%` }}
      >
        {showLabel && <span className="progress-bar-label">{displayLabel}</span>}
      </div>
    </div>
  );
};

ProgressBar.displayName = 'ProgressBar';
