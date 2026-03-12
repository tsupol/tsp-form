import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { Chevron } from './Chevron';
import '../styles/page-nav.css';

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

type PanelProps = {
  id: string;
  className?: string;
  children?: ReactNode;
};

type HeaderProps = {
  title?: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  className?: string;
};

export type PageNavContext = {
  activePanel: string;
  parentPanel: string | null;
  isMobile: boolean;
  isRoot: boolean;
  goTo: (id: string) => void;
  goBack: () => void;
  goToRoot: () => void;
  Panel: (props: PanelProps) => ReactNode;
  Header: (props: HeaderProps) => ReactNode;
};

export type PageNavProps = {
  panels: string[];
  defaultPanel?: string;
  mobileBreakpoint?: number;
  className?: string;
  children: (ctx: PageNavContext) => ReactNode;
};

export function PageNav({
  panels,
  defaultPanel,
  mobileBreakpoint = 768,
  className,
  children,
}: PageNavProps) {
  const rootPanel = panels[0];
  const [navStack, setNavStack] = useState<string[]>([defaultPanel ?? rootPanel]);
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

  // Determine panel state for CSS transitions
  const getPanelState = useCallback((id: string): 'active' | 'behind' | 'ahead' => {
    const idx = panels.indexOf(id);
    const activeIdx = panels.indexOf(activePanel);
    if (id === activePanel) return 'active';
    // Check if this panel is in the stack (behind)
    if (navStack.includes(id)) return 'behind';
    // If panel index < active index, it's behind; otherwise ahead
    if (idx < activeIdx) return 'behind';
    return 'ahead';
  }, [activePanel, navStack, panels]);

  const Panel = useCallback(({ id, className: panelClassName, children: panelChildren }: PanelProps) => {
    if (!isMobile) {
      // Desktop: plain div
      return <div className={panelClassName}>{panelChildren}</div>;
    }

    const state = getPanelState(id);
    return (
      <div
        className={clsx('pagenav-panel', panelClassName)}
        data-state={state}
      >
        {panelChildren}
      </div>
    );
  }, [isMobile, getPanelState]);

  const Header = useCallback(({ title, startContent, endContent, className: headerClassName }: HeaderProps) => {
    if (!isMobile) return null;

    return (
      <div className={clsx('pagenav-header', headerClassName)}>
        <div className="pagenav-header-start">
          {!isRoot && (
            <button className="pagenav-back-btn" onClick={goBack} aria-label="Go back">
              <Chevron direction="left" size={20} animated={false} />
            </button>
          )}
          {startContent}
        </div>
        {title && <div className="pagenav-header-title">{title}</div>}
        {endContent && <div className="pagenav-header-end">{endContent}</div>}
      </div>
    );
  }, [isMobile, isRoot, goBack]);

  const ctx: PageNavContext = {
    activePanel,
    parentPanel,
    isMobile,
    isRoot,
    goTo,
    goBack,
    goToRoot,
    Panel,
    Header,
  };

  return (
    <div className={clsx('pagenav', className)}>
      {children(ctx)}
    </div>
  );
}
