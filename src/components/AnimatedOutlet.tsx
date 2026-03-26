import { useState, useEffect, useRef, type ReactNode } from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import '../styles/animated-outlet.css';

export type AnimatedOutletProps = {
  /** Fallback content when no child route is active (i.e. the index/parent view). */
  fallback?: ReactNode;
  /** Breakpoint in px below which transitions are animated. Default 768. */
  mobileBreakpoint?: number;
  className?: string;
};

const TRANSITION = 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1), opacity 350ms cubic-bezier(0.32, 0.72, 0, 1)';

type Snapshot = { key: string; content: ReactNode };

export function AnimatedOutlet({
  fallback,
  mobileBreakpoint = 768,
  className,
}: AnimatedOutletProps) {
  const outlet = useOutlet();
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < mobileBreakpoint : false,
  );

  const currentKey = location.pathname;
  const hasChild = outlet !== null;

  // Snapshots for animation
  const [exiting, setExiting] = useState<Snapshot | null>(null);
  const prevKeyRef = useRef<string | null>(hasChild ? currentKey : null);
  const prevOutletRef = useRef<ReactNode>(outlet);

  // Mobile detection
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mobileBreakpoint]);

  // Track route changes — capture exiting content
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    const prevOutlet = prevOutletRef.current;

    if (!hasChild && prevKey && isMobile) {
      setExiting({ key: prevKey, content: prevOutlet });
    } else if (hasChild && prevKey && prevKey !== currentKey && isMobile) {
      setExiting({ key: prevKey, content: prevOutlet });
    }

    prevKeyRef.current = hasChild ? currentKey : null;
    prevOutletRef.current = outlet;
  }, [currentKey, hasChild, isMobile]);

  const handleExitEnd = () => setExiting(null);

  // Desktop: no animation
  if (!isMobile) {
    return (
      <div className={clsx('animated-outlet', className)}>
        {hasChild ? outlet : fallback}
      </div>
    );
  }

  // Mobile: parent always visible, child slides over it
  return (
    <div className={clsx('animated-outlet', className)}>
      {/* Parent/fallback — always mounted, hidden off-screen when child is active */}
      <div
        className="animated-outlet-panel better-scroll"
        style={{
          transform: hasChild ? 'translateX(-100%)' : 'translateX(0)',
          pointerEvents: hasChild ? 'none' : 'auto',
          transition: TRANSITION,
        }}
      >
        {fallback}
      </div>

      {/* Exiting child — slides out to right */}
      {exiting && (
        <SlidePanel
          key={exiting.key + '-exit'}
          from="translateX(0)"
          to="translateX(100%)"
          onDone={handleExitEnd}
        >
          {exiting.content}
        </SlidePanel>
      )}

      {/* Current child — slides in from right */}
      {hasChild && (
        <SlidePanel
          key={currentKey}
          from="translateX(100%)"
          to="translateX(0)"
        >
          {outlet}
        </SlidePanel>
      )}
    </div>
  );
}

// ── SlidePanel ──────────────────────────────────────────────────────────────
// Renders at `from` position, then animates to `to` on next frame.

function SlidePanel({
  children,
  from,
  to,
  onDone,
}: {
  children: ReactNode;
  from: string;
  to: string;
  onDone?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: from,
    transition: 'none',
    pointerEvents: 'none',
  });

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setStyle({
          transform: to,
          transition: TRANSITION,
          pointerEvents: to === 'translateX(0)' ? 'auto' : 'none',
        });
      });
    });
  }, []);

  return (
    <div
      ref={ref}
      className="animated-outlet-panel better-scroll"
      style={style}
      onTransitionEnd={onDone ? (e) => {
        if (e.target === ref.current) onDone();
      } : undefined}
    >
      {children}
    </div>
  );
}
