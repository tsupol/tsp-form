import { forwardRef, HTMLAttributes, type CSSProperties } from "react";
import clsx from "clsx";

export type RadioCircleProps = HTMLAttributes<HTMLDivElement> & {
  width?: string | number;
  checked?: boolean;
};

export const RadioCircle = forwardRef<HTMLDivElement, RadioCircleProps>(
  ({ className, width = '1.2rem', checked, style, ...rest }, ref) => {
    const defaultCircleStyle: CSSProperties = {
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      border: '2px solid var(--border-color, #cccccc)',
      borderRadius: '50%',
      width: width,
      height: width,
      cursor: 'pointer',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease-in-out',
      backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-surface)',
      borderColor: checked ? 'var(--color-primary)' : 'var(--border-color, #cccccc)',
    };

    const innerDotStyle: CSSProperties = {
      width: '60%',
      height: '60%',
      backgroundColor: 'var(--color-primary-contrast)',
      borderRadius: '50%',
      transform: checked ? 'scale(1)' : 'scale(0)',
      transition: 'transform 0.2s ease-in-out',
    };

    return (
      <div
        ref={ref}
        className={clsx(className)}
        role="radio"
        aria-checked={checked}
        tabIndex={0}
        style={{ ...defaultCircleStyle, ...style }}
        {...rest}
      >
        <div style={innerDotStyle}/>
      </div>
    );
  }
);

RadioCircle.displayName = "RadioCircle";