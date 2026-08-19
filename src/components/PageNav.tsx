import { useState, useEffect, useCallback, useRef, createContext, useContext, type ReactNode } from 'react';
import { clsx } from 'clsx';
import '../styles/page-nav.css';
import '../styles/scroll.css';

// Ref counting for multiple PageNav instances
let pageNavActiveCount = 0;

function setPageNavActive(active: boolean) {
  if (active) {
    pageNavActiveCount++;
    document.body.setAttribute('data-pagenav-active', '');
  } else {
    pageNavActiveCount = Math.max(0, pageNavActiveCount - 1);
    if (pageNavActiveCount === 0) {
      document.body.removeAttribute('data-pagenav-active');
    }
  }
}

export type PageNavContext = {
  activePanel: string;
  parentPanel: string | null;
  isMobile: boolean;
  isRoot: boolean;
  goTo: (id: string) => void;
  goBack: () => void;
  goToRoot: () => void;
};

export type PageNavPanelProps = {
  id: string;
  className?: string;
  mobileClassName?: string;
  children?: ReactNode;
};

export type PageNavProps = {
  panels: string[];
  defaultPanel?: string;
  /**
   * Controlled mode: the consumer owns which panel is active (typically derived
   * from the URL, so browser history and the visible panel can never disagree).
   * When set, the internal nav stack is ignored — the stack is derived from this
   * value every render — and `goTo`/`goBack`/`goToRoot` become no-ops: navigate
   * with your router instead.
   */
  activePanel?: string;
  mobileBreakpoint?: number;
  /**
   * Also collapse to the mobile stack when the viewport is this short or less,
   * regardless of width. Opt-in — unset means width alone decides.
   *
   * For a phone in landscape (e.g. 844x390) width is a poor signal: it clears
   * `mobileBreakpoint` and gets the side-by-side layout, but there is no
   * vertical room for it. Height separates that case from a genuinely roomy
   * viewport at the same width, like a portrait tablet. ~500 catches every
   * current phone landscape while leaving tablets alone.
   */
  mobileMaxHeight?: number;
  className?: string;
  children: (ctx: PageNavContext) => ReactNode;
};

// Internal context to pass nav state to panels
const PageNavInternalContext = createContext<{
  activePanel: string;
  navStack: string[];
  isMobile: boolean;
} | null>(null);

export function PageNavPanel({ id, className, mobileClassName, children }: PageNavPanelProps) {
  const ctx = useContext(PageNavInternalContext);
  if (!ctx) return null;

  const { activePanel, navStack, isMobile } = ctx;

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  const isActive = id === activePanel;
  const isBehind = id !== activePanel && navStack.includes(id);

  return (
    <div
      className={clsx('pagenav-panel better-scroll', mobileClassName)}
      style={{
        transform: isActive ? 'translateX(0)' : isBehind ? 'translateX(-30%)' : 'translateX(100%)',
        opacity: isBehind ? 0.5 : 1,
        pointerEvents: isActive ? 'auto' : 'none',
        transition: 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1), opacity 350ms cubic-bezier(0.32, 0.72, 0, 1)',
      }}
    >
      {children}
    </div>
  );
}

/** The viewport is "mobile" when it is too narrow, or (opt-in) too short. */
function mobileQuery(breakpoint: number, maxHeight: number | undefined): string {
  const narrow = `(max-width: ${breakpoint - 1}px)`;
  return maxHeight === undefined ? narrow : `${narrow}, (max-height: ${maxHeight}px)`;
}

// Build path from root to target so isRoot is correct on deep-link/refresh
function stackTo(panels: string[], target: string): string[] {
  const rootPanel = panels[0] ?? '';
  if (target === rootPanel) return [rootPanel];
  const idx = panels.indexOf(target);
  return idx > 0 ? panels.slice(0, idx + 1) : [target];
}

export function PageNav({
  panels,
  defaultPanel,
  activePanel: controlledPanel,
  mobileBreakpoint = 768,
  mobileMaxHeight,
  className,
  children,
}: PageNavProps) {
  const rootPanel = panels[0] ?? '';
  const controlled = controlledPanel !== undefined;
  const [internalStack, setInternalStack] = useState<string[]>(() =>
    stackTo(panels, defaultPanel ?? rootPanel)
  );
  // Controlled: derive the stack from the prop every render, so the consumer's
  // source of truth (usually the URL) is the only navigation state there is.
  const navStack = controlled ? stackTo(panels, controlledPanel) : internalStack;
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(mobileQuery(mobileBreakpoint, mobileMaxHeight)).matches
      : false
  );
  const wasMobileRef = useRef(isMobile);

  // Mobile detection
  useEffect(() => {
    const mql = window.matchMedia(mobileQuery(mobileBreakpoint, mobileMaxHeight));
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mobileBreakpoint, mobileMaxHeight]);

  // Reset nav stack when switching from mobile to desktop (uncontrolled only —
  // a controlled stack is derived, there is nothing to reset)
  useEffect(() => {
    if (wasMobileRef.current && !isMobile && !controlled) {
      setInternalStack([rootPanel]);
    }
    wasMobileRef.current = isMobile;
  }, [isMobile, rootPanel, controlled]);

  // Manage body attribute for SideMenu toggle hiding
  useEffect(() => {
    if (isMobile) {
      setPageNavActive(true);
      return () => setPageNavActive(false);
    }
  }, [isMobile]);

  const activePanel = navStack[navStack.length - 1];
  const parentPanel = navStack.length > 1 ? navStack[navStack.length - 2] : null;
  const isRoot = navStack.length <= 1;

  // Unconditional (not NODE_ENV-guarded): the library build inlines NODE_ENV
  // as "production", which would strip the warning from the published dist.
  // Firing only on actual misuse, it is worth keeping everywhere.
  const warnControlled = () => {
    console.warn('PageNav: goTo/goBack/goToRoot are no-ops in controlled mode — change the activePanel prop instead.');
  };

  const goTo = useCallback((id: string) => {
    if (controlled) return warnControlled();
    setInternalStack(prev => [...prev, id]);
  }, [controlled]);

  const goBack = useCallback(() => {
    if (controlled) return warnControlled();
    setInternalStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, [controlled]);

  const goToRoot = useCallback(() => {
    if (controlled) return warnControlled();
    setInternalStack([rootPanel]);
  }, [rootPanel, controlled]);

  const ctx: PageNavContext = {
    activePanel,
    parentPanel,
    isMobile,
    isRoot,
    goTo,
    goBack,
    goToRoot,
  };

  return (
    <PageNavInternalContext.Provider value={{ activePanel, navStack, isMobile }}>
      <div className={clsx('pagenav', className)}>
        {children(ctx)}
      </div>
    </PageNavInternalContext.Provider>
  );
}
