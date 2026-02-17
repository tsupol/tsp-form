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
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = useState(placement);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    // Use offsetWidth/offsetHeight for tooltip size — getBoundingClientRect is affected
    // by the scale() animation and returns smaller dimensions during fade-in
    const tooltipWidth = tooltipRef.current.offsetWidth;
    const tooltipHeight = tooltipRef.current.offsetHeight;

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

    if (placement === 'top' && spaceAbove < tooltipHeight + gap && spaceBelow > spaceAbove) {
      finalPlacement = 'bottom';
    } else if (placement === 'bottom' && spaceBelow < tooltipHeight + gap && spaceAbove > spaceBelow) {
      finalPlacement = 'top';
    } else if (placement === 'left' && spaceLeft < tooltipWidth + gap && spaceRight > spaceLeft) {
      finalPlacement = 'right';
    } else if (placement === 'right' && spaceRight < tooltipWidth + gap && spaceLeft > spaceRight) {
      finalPlacement = 'left';
    }

    let top = 0;
    let left = 0;

    switch (finalPlacement) {
      case 'top':
        top = triggerRect.top - tooltipHeight - gap;
        left = triggerRect.left + (triggerRect.width - tooltipWidth) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipWidth) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipHeight) / 2;
        left = triggerRect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipHeight) / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Keep tooltip within viewport
    // Only clamp cross-axis — main axis is handled by flip logic above
    if (finalPlacement === 'top' || finalPlacement === 'bottom') {
      if (left + tooltipWidth > viewportWidth - gap) {
        left = viewportWidth - tooltipWidth - gap;
      }
      if (left < gap) left = gap;
    }
    if (finalPlacement === 'left' || finalPlacement === 'right') {
      if (top + tooltipHeight > viewportHeight - gap) {
        top = viewportHeight - tooltipHeight - gap;
      }
      if (top < gap) top = gap;
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
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        className="tooltip-trigger"
      >
        {children}
      </span>

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
