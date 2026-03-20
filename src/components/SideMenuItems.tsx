import { type ReactNode, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { PopOver } from './PopOver';
import { Chevron } from './Chevron';
import clsx from 'clsx';
import '../styles/side-menu-items.css';

export type SideMenuItemEntry = {
  type?: 'item';
  key: string;
  icon?: ReactNode;
  label: ReactNode;
  badge?: ReactNode;
  path?: string;
  children?: SideMenuItemData[];
  disabled?: boolean;
};

export type SideMenuItemCustom = {
  type: 'custom';
  key: string;
  render: (props: { collapsed: boolean; isMobile: boolean }) => ReactNode;
};

export type SideMenuItemData =
  | SideMenuItemEntry
  | SideMenuItemCustom
  | { type: 'group'; key: string; label: ReactNode; }
  | { type: 'separator'; key: string; };

export type SideMenuItemsProps = {
  items: SideMenuItemData[];
  activeItem?: string;
  activePath?: string;
  collapsed?: boolean;
  isMobile?: boolean;
  onSelect?: (key: string, path?: string) => void;
  onCloseMobile?: () => void;
  autoCloseMobile?: boolean;
  showChevron?: boolean;
  flyoutAlign?: 'start' | 'center' | 'end';
  disableFlyoutOnActive?: boolean;
  className?: string;
};

// Find the item key whose path is the longest prefix match for the given URL
function findActiveKeyByPath(items: SideMenuItemData[], activePath: string | undefined): string | undefined {
  if (!activePath) return undefined;
  const path = activePath;

  let bestKey: string | undefined;
  let bestLength = 0;

  function walk(nodes: SideMenuItemData[]) {
    for (const node of nodes) {
      if (node.type === 'group' || node.type === 'separator' || node.type === 'custom') continue;
      if (node.path) {
        if (node.path === '/') {
          if (path === '/') { bestKey = node.key; bestLength = Infinity; }
        } else if (path.startsWith(node.path) && node.path.length > bestLength) {
          bestKey = node.key;
          bestLength = node.path.length;
        }
      }
      if (node.children) walk(node.children);
    }
  }

  walk(items);
  return bestKey;
}

// Collect all ancestor keys of the active item
function getActiveAncestors(items: SideMenuItemData[], activeKey: string | undefined): Set<string> {
  const ancestors = new Set<string>();
  if (!activeKey) return ancestors;

  function walk(nodes: SideMenuItemData[], path: string[]): boolean {
    for (const node of nodes) {
      if (node.type === 'group' || node.type === 'separator' || node.type === 'custom') continue;
      if (node.key === activeKey) {
        for (const k of path) ancestors.add(k);
        return true;
      }
      if (node.children && walk(node.children, [...path, node.key])) {
        return true;
      }
    }
    return false;
  }

  walk(items, []);
  return ancestors;
}

export function SideMenuItems({
  items,
  activeItem,
  activePath,
  collapsed = false,
  isMobile = false,
  onSelect,
  onCloseMobile,
  autoCloseMobile = true,
  showChevron = true,
  flyoutAlign = 'center',
  disableFlyoutOnActive = false,
  className,
}: SideMenuItemsProps) {
  const effectiveActiveKey = useMemo(
    () => activeItem ?? findActiveKeyByPath(items, activePath),
    [activeItem, activePath, items],
  );
  const activeAncestors = useMemo(() => getActiveAncestors(items, effectiveActiveKey), [items, effectiveActiveKey]);

  const handleSelect = useCallback((key: string, path?: string) => {
    onSelect?.(key, path);
    if (autoCloseMobile && isMobile && path) {
      onCloseMobile?.();
    }
  }, [onSelect, onCloseMobile, autoCloseMobile, isMobile]);

  // collapsed only applies on desktop — mobile uses slide-out, not icon-only
  const isCollapsed = collapsed && !isMobile;

  return (
    <div className={clsx('side-menu-items', isCollapsed && 'collapsed', className)}>
      {items.map((item) => {
        if (item.type === 'separator') {
          return <hr key={item.key} className="side-menu-separator" />;
        }
        if (item.type === 'group') {
          return (
            <div key={item.key} className="side-menu-group-label">
              {!isCollapsed && <span className="side-menu-group-text">{item.label}</span>}
            </div>
          );
        }
        if (item.type === 'custom') {
          return (
            <div key={item.key} className="side-menu-custom-item">
              {item.render({ collapsed: isCollapsed, isMobile })}
            </div>
          );
        }
        return (
          <SideMenuItemRow
            key={item.key}
            item={item}
            activeItem={effectiveActiveKey}
            activeAncestors={activeAncestors}
            collapsed={isCollapsed}
            isMobile={isMobile}
            onSelect={handleSelect}
            showChevron={showChevron}
            flyoutAlign={flyoutAlign}
            disableFlyoutOnActive={disableFlyoutOnActive}
            level={0}
          />
        );
      })}
    </div>
  );
}

type SideMenuItemRowProps = {
  item: SideMenuItemEntry;
  activeItem?: string;
  activeAncestors: Set<string>;
  collapsed?: boolean;
  isMobile?: boolean;
  onSelect?: (key: string, path?: string) => void;
  onCloseFlyout?: () => void;
  showChevron?: boolean;
  flyoutAlign?: 'start' | 'center' | 'end';
  disableFlyoutOnActive?: boolean;
  level: number;
};

function SideMenuItemRow({
  item,
  activeItem,
  activeAncestors,
  collapsed,
  isMobile,
  onSelect,
  onCloseFlyout,
  showChevron,
  flyoutAlign,
  disableFlyoutOnActive,
  level,
}: SideMenuItemRowProps) {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hasChildren = !!(item.children && item.children.length > 0);
  const isActive = activeItem === item.key;
  const isActiveAncestor = activeAncestors.has(item.key);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setFlyoutOpen(false), 120);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const handleMouseEnter = () => {
    if (isMobile || isTouchDevice) return;
    cancelClose();
    if (hasChildren) setFlyoutOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile || isTouchDevice) return;
    scheduleClose();
  };

  const handleClick = () => {
    if (item.disabled) return;

    // Mobile with children: tap toggles accordion (parent path is not navigable)
    if (isMobile && hasChildren) {
      setAccordionOpen(prev => !prev);
      return;
    }

    // Touch device with flyout: toggle on tap
    if (isTouchDevice && hasChildren && !isMobile) {
      setFlyoutOpen(prev => !prev);
      return;
    }

    // Desktop or leaf item: navigate directly
    if (item.path) {
      onSelect?.(item.key, item.path);
      onCloseFlyout?.();
    } else if (!hasChildren) {
      onSelect?.(item.key);
      onCloseFlyout?.();
    }
  };

  const flyoutDisabled = disableFlyoutOnActive && (isActive || isActiveAncestor);

  const trigger = (
    <button
      className={clsx('side-menu-item', (isActive || isActiveAncestor) && 'active', item.disabled && 'disabled')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {item.icon && <span className="side-menu-item-icon">{item.icon}</span>}
      {!collapsed && <span className="side-menu-item-label">{item.label}</span>}
      {item.badge}
      {!collapsed && hasChildren && showChevron && !(flyoutDisabled && !isMobile) && (
        <span className="side-menu-item-chevron">
          {isMobile ? (
            <Chevron direction="right" open={accordionOpen} size={14} />
          ) : (
            <Chevron direction="right" size={14} />
          )}
        </span>
      )}
    </button>
  );

  // Desktop: flyout via PopOver
  if (hasChildren && !isMobile && !flyoutDisabled) {
    const closeFlyoutChain = () => {
      setFlyoutOpen(false);
      onCloseFlyout?.();
    };

    return (
      <PopOver
        isOpen={flyoutOpen}
        onClose={() => setFlyoutOpen(false)}
        placement="right"
        align={flyoutAlign}
        offset={4}
        openDelay={0}
        maxHeight="calc(100dvh - 2rem)"
        trigger={trigger}
      >
        <div
          className="side-menu-flyout"
          onMouseEnter={() => { cancelClose(); }}
          onMouseLeave={() => { scheduleClose(); }}
        >
          {item.children!.map((child) => {
            if (child.type === 'separator') return <hr key={child.key} className="side-menu-separator" />;
            if (child.type === 'group') return (
              <div key={child.key} className="side-menu-group-label">
                <span className="side-menu-group-text">{child.label}</span>
              </div>
            );
            return (
              <SideMenuItemRow
                key={child.key}
                item={child}
                activeItem={activeItem}
                activeAncestors={activeAncestors}
                collapsed={false}
                isMobile={false}
                onSelect={onSelect}
                onCloseFlyout={closeFlyoutChain}
                showChevron={showChevron}
                flyoutAlign={flyoutAlign}
                disableFlyoutOnActive={disableFlyoutOnActive}
                level={level + 1}
              />
            );
          })}
        </div>
      </PopOver>
    );
  }

  // Mobile: accordion using CSS grid row animation
  if (hasChildren && isMobile) {
    return (
      <>
        {trigger}
        <div className={clsx('side-menu-accordion', accordionOpen && 'open')}>
          <div className="side-menu-accordion-inner">
            {item.children!.map((child) => {
              if (child.type === 'separator') return <hr key={child.key} className="side-menu-separator" />;
              if (child.type === 'group') return (
                <div key={child.key} className="side-menu-group-label">
                  <span className="side-menu-group-text">{child.label}</span>
                </div>
              );
              return (
                <SideMenuItemRow
                  key={child.key}
                  item={child}
                  activeItem={activeItem}
                  activeAncestors={activeAncestors}
                  collapsed={false}
                  isMobile={true}
                  onSelect={onSelect}
                  showChevron={showChevron}
                  flyoutAlign={flyoutAlign}
                  disableFlyoutOnActive={disableFlyoutOnActive}
                  level={level + 1}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  }

  // Leaf item (no children)
  return trigger;
}
