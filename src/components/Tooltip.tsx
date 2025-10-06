import { useEffect, useRef, useState, useLayoutEffect, ReactNode } from 'react';
import '../styles/tooltip.css';

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
  disabled?: boolean;
};

export const Tooltip = ({
  content,
  children,
  placement = 'top',
  delay = 200,
  className = '',
  disabled = false,
}: TooltipProps) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = useState(placement);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const gap = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available space
    const spaceAbove = triggerRect.top;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewportWidth - triggerRect.right;

    // Determine best placement
    let finalPlacement = placement;

    if (placement === 'top' && spaceAbove < tooltipRect.height + gap && spaceBelow > spaceAbove) {
      finalPlacement = 'bottom';
    } else if (placement === 'bottom' && spaceBelow < tooltipRect.height + gap && spaceAbove > spaceBelow) {
      finalPlacement = 'top';
    } else if (placement === 'left' && spaceLeft < tooltipRect.width + gap && spaceRight > spaceLeft) {
      finalPlacement = 'right';
    } else if (placement === 'right' && spaceRight < tooltipRect.width + gap && spaceLeft > spaceRight) {
      finalPlacement = 'left';
    }

    let top = 0;
    let left = 0;

    switch (finalPlacement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Keep tooltip within viewport
    if (left + tooltipRect.width > viewportWidth - gap) {
      left = viewportWidth - tooltipRect.width - gap;
    }
    if (left < gap) {
      left = gap;
    }
    if (top + tooltipRect.height > viewportHeight - gap) {
      top = viewportHeight - tooltipRect.height - gap;
    }
    if (top < gap) {
      top = gap;
    }

    setPosition({ top, left });
    setActualPlacement(finalPlacement);
  };

  useLayoutEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => calculatePosition();
    const handleResize = () => calculatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="tooltip-trigger"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip-${actualPlacement} ${className}`}
          style={{
            top: position.top,
            left: position.left,
          }}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </>
  );
};

Tooltip.displayName = 'Tooltip';
