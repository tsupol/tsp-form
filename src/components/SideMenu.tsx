import { type ReactNode, useEffect, useState } from 'react';
import '../styles/side-menu.css';
import clsx from 'clsx';

interface SideMenuProps {
  isCollapsed?: boolean;
  className?: string;
  mobileBreakpoint?: number;
  linkFn?: (to: string) => void;
  title?: ReactNode;
  items: ReactNode;
  onToggleCollapse?: (collapsed: boolean) => void;
  titleRenderer: (collapsed: boolean, handleToggle: () => void) => ReactNode;
}

export const SideMenu = ({
  isCollapsed = false,
  onToggleCollapse,
  className = "",
  titleRenderer,
  mobileBreakpoint = 768,
  items = [],
  linkFn = (to: string) => {},
  title = "Menu",
}: SideMenuProps) => {
  const [collapsed, setCollapsed] = useState(isCollapsed);
  const [isMobile, setIsMobile] = useState(window.innerWidth < mobileBreakpoint);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    onToggleCollapse?.(newState);
  };

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
      // Auto-close menu on mobile
      if (window.innerWidth < mobileBreakpoint) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    checkIsMobile();
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <nav className={clsx('side-menu', collapsed ? 'collapsed' : 'expanded', isMobile ? 'mobile' : '', className)}>
      {titleRenderer(collapsed, handleToggle)}
      <div className="side-menu-content-wrapper">
        {items}
      </div>
    </nav>
  );
};

