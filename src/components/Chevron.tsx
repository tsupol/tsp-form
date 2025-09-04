"use client"
import React from 'react';
import clsx from 'clsx';
import "../styles/form.css";
import '../styles/chevron.css';

type Direction = 'down' | 'up' | 'left' | 'right';

export type ChevronProps = {
  direction?: Direction;     // visual direction when "closed"
  open?: boolean;            // if provided, animates to an "expanded" angle
  size?: number | string;    // 16 | 20 | '1em' | '24px' ...
  strokeWidth?: number;      // 1 to 2.5 typically
  className?: string;
  title?: string;
  'aria-label'?: string;
  animated?: boolean;        // enables CSS transition
};

export function Chevron({
                          direction = 'down',
                          open,
                          size = 16,
                          strokeWidth = 2,
                          className,
                          title,
                          animated = true,
                          ...aria
                        }: ChevronProps) {
  // Base rotation angles for the "closed" state
  const baseAngle: Record<Direction, number> = {
    down: 0,
    up: 180,
    left: 90,
    right: -90,
  };

  // If `open` is provided, rotate to a sensible expanded angle
  const angle = (() => {
    if (open === undefined) return baseAngle[direction];
    if (direction === 'down') return open ? 180 : 0;   // caret flips up when open
    if (direction === 'right') return open ? 0 : -90;  // caret points down when open
    // For 'up' and 'left' keep base angle unless you want a custom behavior
    return baseAngle[direction];
  })();

  // Map to Tailwind rotation classes we actually use
  const angleClass =
    angle === 0
      ? 'rotate-0'
      : angle === 180
        ? 'rotate-180'
        : angle === 90
          ? 'rotate-90'
          : angle === -90
            ? '-rotate-90'
            : 'rotate-0';

  // Inline SVG chevron (stroke follows currentColor)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size as number}
      height={size as number}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clsx(
        'shrink-0',
        animated && 'chevron-animated',
        angleClass,
        className
      )}
      aria-hidden={aria['aria-label'] ? undefined : true}
      role={aria['aria-label'] ? 'img' : undefined}
      {...aria}
    >
      {title ? <title>{title}</title> : null}
      {/* ChevronDown path */}
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}