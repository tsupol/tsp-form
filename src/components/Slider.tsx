import { forwardRef, InputHTMLAttributes, useState, useCallback } from 'react';
import clsx from 'clsx';
import '../styles/slider.css';

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  showMinMax?: boolean;
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value = 0,
      onChange,
      min = 0,
      max = 100,
      step = 1,
      showValue = false,
      showMinMax = false,
      size = 'md',
      disabled = false,
      error = false,
      ...rest
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);
        onChange?.(newValue);
      },
      [onChange]
    );

    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div
        className={clsx(
          'slider-wrapper',
          `slider-${size}`,
          {
            'slider-disabled': disabled,
            'slider-dragging': isDragging,
            'slider-error': error,
          },
          className
        )}
      >
        {showMinMax && (
          <span className="slider-min-max-label">{min}</span>
        )}
        <div className="slider-container">
          <input
            ref={ref}
            type="range"
            className="slider-input"
            value={value}
            onChange={handleChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            {...rest}
          />
          <div
            className="slider-track-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showMinMax && (
          <span className="slider-min-max-label">{max}</span>
        )}
        {showValue && (
          <span className="slider-value-label">{value}</span>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';
