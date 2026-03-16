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
  mobileBreakpoint?: number;
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

export function PageNav({
  panels,
  defaultPanel,
  mobileBreakpoint = 768,
  className,
  children,
}: PageNavProps) {
  const rootPanel = panels[0] ?? '';
  const [navStack, setNavStack] = useState<string[]>(() => {
    const target = defaultPanel ?? rootPanel;
    if (target === rootPanel) return [rootPanel];
    // Build path from root to target so isRoot is correct on deep-link/refresh
    const idx = panels.indexOf(target);
    return idx > 0 ? panels.slice(0, idx + 1) : [target];
  });
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < mobileBreakpoint : false
  );
  const wasMobileRef = useRef(isMobile);

  // Mobile detection
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [mobileBreakpoint]);

  // Reset nav stack when switching from mobile to desktop
  useEffect(() => {
    if (wasMobileRef.current && !isMobile) {
      setNavStack([rootPanel]);
    }
    wasMobileRef.current = isMobile;
  }, [isMobile, rootPanel]);

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

  const goTo = useCallback((id: string) => {
    setNavStack(prev => [...prev, id]);
  }, []);

  const goBack = useCallback(() => {
    setNavStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  }, []);

  const goToRoot = useCallback(() => {
    setNavStack([rootPanel]);
  }, [rootPanel]);

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
