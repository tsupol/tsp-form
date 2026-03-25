import { useState, useEffect, useCallback, useRef, createContext, useContext, type ReactNode } from 'react';
import { clsx } from 'clsx';
import '../styles/route-transition.css';

// ── Context ──────────────────────────────────────────────────────────────────

type Direction = 'forward' | 'back';

type RouteTransitionContextValue = {
  direction: Direction;
  /** Signal that the next location change is a forward (push) navigation. */
  goForward: () => void;
  /** Signal that the next location change is a back navigation. */
  goBack: () => void;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue>({
  direction: 'forward',
  goForward: () => {},
  goBack: () => {},
});

export function useRouteTransition() {
  return useContext(RouteTransitionContext);
}

// ── RouteTransition ──────────────────────────────────────────────────────────

export type RouteTransitionProps = {
  /** A key that changes when the route changes (e.g. location.pathname + location.search). */
  locationKey: string;
  /** The content to render for the current route (e.g. <Outlet /> or children). */
  children: ReactNode;
  /** Breakpoint in px below which transitions are animated. Default 768. */
  mobileBreakpoint?: number;
  className?: string;
};

const TRANSITION = 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1)';

type PageEntry = {
  key: string;
  content: ReactNode;
  direction: Direction;
};

export function RouteTransition({
  locationKey,
  children,
  mobileBreakpoint = 768,
  className,
}: RouteTransitionProps) {
  const directionRef = useRef<Direction>('forward');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < mobileBreakpoint : false
  );
  const [pages, setPages] = useState<PageEntry[]>([
    { key: locationKey, content: children, direction: 'forward' },
  ]);
  const [transitioning, setTransitioning] = useState(false);

  // Mobile detection
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mobileBreakpoint]);

  // Direction signaling — consumer calls these before navigating
  const goForward = useCallback(() => {
    directionRef.current = 'forward';
  }, []);

  const goBack = useCallback(() => {
    directionRef.current = 'back';
  }, []);

  // When locationKey changes, push a new page entry
  useEffect(() => {
    setPages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.key === locationKey) {
        // Same key — update content in place (re-render, no transition)
        return prev.map((p, i) => i === prev.length - 1 ? { ...p, content: children } : p);
      }
      return [...prev, { key: locationKey, content: children, direction: directionRef.current }];
    });
    if (isMobile) {
      setTransitioning(true);
    }
    // Reset direction after consuming it
    directionRef.current = 'forward';
  }, [locationKey]); // intentionally omit children/isMobile — we only push on key change

  // After transition ends, keep only the latest page
  const handleTransitionEnd = useCallback(() => {
    setTransitioning(false);
    setPages(prev => prev.length > 1 ? [prev[prev.length - 1]] : prev);
  }, []);

  const ctxValue: RouteTransitionContextValue = {
    direction: directionRef.current,
    goForward,
    goBack,
  };

  // Desktop: no transition, just render current content
  if (!isMobile) {
    return (
      <RouteTransitionContext.Provider value={ctxValue}>
        <div className={clsx('route-transition', className)}>
          {children}
        </div>
      </RouteTransitionContext.Provider>
    );
  }

  // Mobile: render all pages in stack with slide animation
  return (
    <RouteTransitionContext.Provider value={ctxValue}>
      <div className={clsx('route-transition', className)}>
        {pages.map((page, i) => {
          const isLatest = i === pages.length - 1;
          const latestDir = pages[pages.length - 1].direction;

          let transform: string;
          if (!transitioning || pages.length === 1) {
            transform = 'translateX(0)';
          } else if (isLatest) {
            transform = 'translateX(0)';
          } else if (latestDir === 'forward') {
            transform = 'translateX(-100%)';
          } else {
            transform = 'translateX(100%)';
          }

          const needsInitial = transitioning && isLatest && pages.length > 1;

          return (
            <TransitionPanel
              key={page.key}
              transform={transform}
              initialTransform={needsInitial ? (latestDir === 'forward' ? 'translateX(100%)' : 'translateX(-100%)') : undefined}
              isActive={isLatest}
              onTransitionEnd={isLatest ? handleTransitionEnd : undefined}
            >
              {page.content}
            </TransitionPanel>
          );
        })}
      </div>
    </RouteTransitionContext.Provider>
  );
}

// ── TransitionPanel (internal) ───────────────────────────────────────────────

function TransitionPanel({
  children,
  transform,
  initialTransform,
  isActive,
  onTransitionEnd,
}: {
  children: ReactNode;
  transform: string;
  initialTransform?: string;
  isActive: boolean;
  onTransitionEnd?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: initialTransform ?? transform,
    transition: 'none',
    pointerEvents: isActive ? 'auto' : 'none',
  });

  useEffect(() => {
    if (initialTransform != null) {
      // Start at initial position, then animate to target on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStyle({
            transform,
            transition: TRANSITION,
            pointerEvents: isActive ? 'auto' : 'none',
          });
        });
      });
    } else {
      setStyle(prev => ({
        ...prev,
        pointerEvents: isActive ? 'auto' : 'none',
        transform,
        transition: TRANSITION,
      }));
    }
  }, [transform, isActive]);

  return (
    <div
      ref={ref}
      className="route-transition-panel"
      style={style}
      onTransitionEnd={onTransitionEnd ? (e) => {
        if (e.target === ref.current) onTransitionEnd();
      } : undefined}
    >
      {children}
    </div>
  );
}
