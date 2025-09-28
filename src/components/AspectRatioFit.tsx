import { type ReactNode, useEffect, useRef, useState } from 'react';
import "../styles/aspect-ratio-fit.css";

interface AspectRatioFitProps {
  children: ReactNode;
  aspectRatio?: number; // width/height ratio, default 1 (square)
  className?: string;
  padding?: number; // padding from container edges
}

export const AspectRatioFit = ({
  children,
  aspectRatio = 1,
  className = '',
  padding = 0 // Changed default from 20 to 0
}: AspectRatioFitProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const container = containerRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const availableWidth = containerRect.width - padding * 2;
      const availableHeight = containerRect.height - padding * 2;

      // Calculate dimensions based on aspect ratio constraints
      const widthBasedHeight = availableWidth / aspectRatio;
      const heightBasedWidth = availableHeight * aspectRatio;

      let finalWidth, finalHeight;

      if (widthBasedHeight <= availableHeight) {
        // Width is the limiting factor
        finalWidth = availableWidth;
        finalHeight = widthBasedHeight;
      } else {
        // Height is the limiting factor
        finalWidth = heightBasedWidth;
        finalHeight = availableHeight;
      }

      setDimensions({
        width: finalWidth,
        height: finalHeight
      });
    };

    // Initial calculation
    updateDimensions();

    // Update on window resize
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current?.parentElement) {
      resizeObserver.observe(containerRef.current.parentElement);
    }

    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [aspectRatio, padding]);

  return (
    <div
      ref={containerRef}
      className={`aspect-ratio-fit ${className}`}
      style={{
        width: dimensions.width > 0 ? `${dimensions.width}px` : 'auto',
        height: dimensions.height > 0 ? `${dimensions.height}px` : 'auto',
      }}
    >
      {children}
    </div>
  );
};