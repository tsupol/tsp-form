import { forwardRef, HTMLAttributes, type CSSProperties } from "react";
import clsx from "clsx";

export type RadioCircleProps = HTMLAttributes<HTMLDivElement> & {
  width?: string | number;
  checked?: boolean;
};

export const RadioCircle = forwardRef<HTMLDivElement, RadioCircleProps>(
  ({ className, width = '1rem', checked, style, ...rest }, ref) => {
    const defaultCircleStyle: CSSProperties = {
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '50%',
      width: width,
      height: width,
      minWidth: width,
      minHeight: width,
      cursor: 'pointer',
      boxSizing: 'border-box',
      transition: 'all 0.2s ease-in-out',
      backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-surface)',
      boxShadow: checked
        ? 'inset 0 0 0 1px var(--color-primary)'
        : 'inset 0 0 0 1px var(--border-color, #cccccc)',
      flexShrink: 0,
    };

    const innerDotStyle: CSSProperties = {
      width: '50%',
      height: '50%',
      backgroundColor: 'var(--color-primary-contrast)',
      borderRadius: '50%',
      transform: checked ? 'scale(1)' : 'scale(0)',
      transition: 'transform 0.2s ease-in-out',
      flexShrink: 0,
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