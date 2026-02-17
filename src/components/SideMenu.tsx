import { type ReactNode, useEffect, useState, useRef, useCallback } from 'react';
import '../styles/side-menu.css';
import clsx from 'clsx';

interface SideMenuProps {
  isCollapsed?: boolean;
  className?: string;
  mobileBreakpoint?: number;
  autoCloseMobileOnClick?: boolean;
  linkFn?: (to: string) => void;
  title?: ReactNode;
  items: ReactNode;
  onToggleCollapse?: (collapsed: boolean) => void;
  titleRenderer: (collapsed: boolean, handleToggle: () => void, isMobile: boolean) => ReactNode;
  mobileToggleRenderer?: (handleToggle: () => void) => ReactNode;
}

export const SideMenu = ({
  isCollapsed = false,
  onToggleCollapse,
  className = "",
  titleRenderer,
  mobileToggleRenderer,
  mobileBreakpoint = 768,
  autoCloseMobileOnClick = true,
  items = [],
  linkFn = (to: string) => {},
  title = "Menu",
}: SideMenuProps) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [isMobile, setIsMobile] = useState(window.innerWidth < mobileBreakpoint);
  const [toggleVisible, setToggleVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Sync with external isCollapsed prop
  useEffect(() => {
    setCollapsed(isCollapsed);
  }, [isCollapsed]);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onToggleCollapse?.(newState);
  };

  const handleClose = () => {
    if (isMobile && !collapsed) {
      setCollapsed(true);
      onToggleCollapse?.(true);
    }
  };

  // Scroll-aware toggle visibility
  const handleScroll = useCallback(() => {
    if (!isMobile || !collapsed) return;

    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY.current;

    // Show on scroll up (or at top), hide on scroll down
    if (scrollDelta < -5 || currentScrollY < 10) {
      setToggleVisible(true);
    } else if (scrollDelta > 5) {
      setToggleVisible(false);
    }

    lastScrollY.current = currentScrollY;
  }, [isMobile, collapsed]);

  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < mobileBreakpoint;
      setIsMobile(mobile);
      // Auto-close menu on mobile
      if (mobile) {
        setCollapsed(true);
        onToggleCollapse?.(true);
      } else {
        setCollapsed(false);
        onToggleCollapse?.(false);
      }
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [mobileBreakpoint]);

  // Scroll listener for toggle visibility
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <>
      {/* Mobile toggle button - scroll-aware visibility */}
      {isMobile && collapsed && mobileToggleRenderer && (
        <div className={clsx('side-menu-mobile-toggle', !toggleVisible && 'hidden')}>
          {mobileToggleRenderer(handleToggle)}
        </div>
      )}
      {/* Backdrop for mobile */}
      {isMobile && !collapsed && (
        <div
          className="side-menu-backdrop"
          onClick={handleClose}
        />
      )}
      <nav className={clsx('side-menu', collapsed ? 'collapsed' : 'expanded', isMobile ? 'mobile' : '', className)}>
        {titleRenderer(collapsed, handleToggle, isMobile)}
        <div className="side-menu-content-wrapper" onClick={isMobile && autoCloseMobileOnClick ? handleClose : undefined}>
          {items}
        </div>
      </nav>
    </>
  );
};

