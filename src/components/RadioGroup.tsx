import { RadioCircle, RadioCircleProps } from './RadioCircle';
import clsx from 'clsx';

import type { ReactNode, ComponentProps } from 'react';

interface RadioOption<T> {
  value: T;
  label: ReactNode;
}

interface RadioGroupProps<T extends string | number> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  className?: string;
  radioCircleProps?: Partial<Omit<RadioCircleProps, 'checked' | 'onClick'>>;
  error?: boolean;
}

export const RadioGroup = <T extends string | number>(
  {
    name,
    value,
    onChange,
    options,
    className,
    radioCircleProps,
    error,
  }: RadioGroupProps<T>) => {
  return (
    <div className={clsx(className, error && 'form-field-error')} role="radiogroup" aria-label={name}>
      {options.map((option) => (
        <div
          key={String(option.value)}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => onChange(option.value)}>
          <RadioCircle
            checked={option.value === value}
            {...radioCircleProps}
          />
          <span style={{ marginLeft: '0.5rem' }}>{option.label}</span>
        </div>
      ))}
    </div>
  );
};