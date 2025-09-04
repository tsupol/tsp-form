'use client';
import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import "../styles/scroll.css";
import "../styles/popover.css";

interface PopOverProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  className?: string;
  triggerClassName?: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  maxHeight?: string;
}

export function PopOver({
                          isOpen,
                          onClose,
                          trigger,
                          children,
                          placement = 'bottom',
                          align = 'start',
                          className = '',
                          triggerClassName = '',
                          width = '200px',
                          minWidth = '200px',
                          maxWidth = '400px',
                          maxHeight = '300px',
                        }: PopOverProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] = useState(placement);
  const [isPositioned, setIsPositioned] = useState(false);

  const calculatePosition = () => {
    if (!triggerRef.current || !popoverRef.current || !isOpen) return;

    // Get viewport-relative positions
    const triggerRect = triggerRef.current.getBoundingClientRect();

    // Get actual popover dimensions by temporarily positioning it off-screen
    const popover = popoverRef.current;
    const originalStyle = {
      position: popover.style.position,
      top: popover.style.top,
      left: popover.style.left,
      visibility: popover.style.visibility
    };

    // Position off-screen to measure
    popover.style.position = 'fixed';
    popover.style.top = '-9999px';
    popover.style.left = '-9999px';
    popover.style.visibility = 'hidden';
    popover.style.minWidth = minWidth;

    const popoverRect = popover.getBoundingClientRect();

    // Restore original styles
    Object.assign(popover.style, originalStyle);

    const gap = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available space in each direction
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const spaceRight = viewportWidth - triggerRect.right;
    const spaceLeft = triggerRect.left;

    // Determine best placement based on available space
    let finalPlacement = placement;

    // Auto-flip based on space requirements
    if (placement === 'bottom') {
      if (spaceBelow < popoverRect.height + gap && spaceAbove >= popoverRect.height + gap) {
        finalPlacement = 'top';
      }
    } else if (placement === 'top') {
      if (spaceAbove < popoverRect.height + gap && spaceBelow >= popoverRect.height + gap) {
        finalPlacement = 'bottom';
      }
    } else if (placement === 'right') {
      if (spaceRight < popoverRect.width + gap && spaceLeft >= popoverRect.width + gap) {
        finalPlacement = 'left';
      }
    } else if (placement === 'left') {
      if (spaceLeft < popoverRect.width + gap && spaceRight >= popoverRect.width + gap) {
        finalPlacement = 'right';
      }
    }

    let top = 0;
    let left = 0;

    // Calculate position based on final placement
    switch (finalPlacement) {
      case 'bottom':
      case 'top':
        // Vertical placement - calculate horizontal alignment
        top = finalPlacement === 'bottom' ?
          triggerRect.bottom + gap :
          triggerRect.top - popoverRect.height - gap;

        // Calculate left position based on alignment
        switch (align) {
          case 'start':
            left = triggerRect.left;
            break;
          case 'center':
            left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
            break;
          case 'end':
            left = triggerRect.right - popoverRect.width;
            break;
        }

        // Only adjust if popover would go off screen
        if (left + popoverRect.width > viewportWidth - gap) {
          left = viewportWidth - popoverRect.width - gap;
        }
        if (left < gap) {
          left = gap;
        }
        break;

      case 'right':
      case 'left':
        // Horizontal placement - calculate vertical alignment
        left = finalPlacement === 'right' ?
          triggerRect.right + gap :
          triggerRect.left - popoverRect.width - gap;

        // Calculate top position based on alignment
        switch (align) {
          case 'start':
            top = triggerRect.top;
            break;
          case 'center':
            top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
            break;
          case 'end':
            top = triggerRect.bottom - popoverRect.height;
            break;
        }

        // Only adjust if popover would go off screen
        if (top + popoverRect.height > viewportHeight - gap) {
          top = viewportHeight - popoverRect.height - gap;
        }
        if (top < gap) {
          top = gap;
        }
        break;
    }

    setPosition({ top, left });
    setActualPlacement(finalPlacement);
    setIsPositioned(true);
  };

  // Initial positioning
  useLayoutEffect(() => {
    if (isOpen) {
      setIsPositioned(false);
      // Use requestAnimationFrame to ensure DOM is fully updated
      const frame = requestAnimationFrame(() => {
        calculatePosition();
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsPositioned(false);
    }
  }, [isOpen, placement, align]);

  // Recalculate on scroll and resize with throttling
  useEffect(() => {
    if (!isOpen) return;

    let timeoutId: NodeJS.Timeout;

    const throttledCalculate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculatePosition, 16); // ~60fps
    };

    // Listen to all scroll events (including nested)
    const handleScroll = () => throttledCalculate();
    const handleResize = () => throttledCalculate();

    // Use capture to catch all scroll events
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Close on outside click and escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        popoverRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div ref={triggerRef} className={triggerClassName}>
        {trigger}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className={`popover scroll-overlay ${
            isPositioned ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          style={{
            top: position.top,
            left: position.left,
            width: width,
            minWidth: minWidth,
            maxWidth: `min(${maxWidth}, ${window.innerWidth - 32}px)`,
            maxHeight: `min(${maxHeight}, ${window.innerHeight - 32}px)`,
            overflowY: 'auto'
          }}
        >
          {children}
        </div>
      )}
    </>
  );
}