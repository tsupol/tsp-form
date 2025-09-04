"use client";
import React from 'react';
import { FC, useEffect, useRef, useState } from 'react';

interface ScreenHeightFitProps {
  children: React.ReactNode;
  className?: string;
  padding?: number; // padding from bottom of screen
}

export const ScreenHeightFit: FC<ScreenHeightFitProps> = ({
                                                            children,
                                                            className = '',
                                                            padding = 20
                                                          }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const availableHeight = window.innerHeight - rect.top - padding;

      setHeight(availableHeight);
    };

    // Initial calculation
    updateHeight();

    // Update on window resize
    window.addEventListener('resize', updateHeight);
    window.addEventListener('scroll', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('scroll', updateHeight);
    };
  }, [padding]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: height > 0 ? `${height}px` : 'auto',
      }}
    >
      {children}
    </div>
  );
};