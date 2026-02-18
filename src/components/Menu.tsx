import { type ReactNode, useState, useRef, useCallback } from 'react';
import { PopOver } from './PopOver';
import { Chevron } from './Chevron';
import clsx from 'clsx';
import '../styles/menu.css';

/* ── MenuItem ─────────────────────────────────────────────────── */

export type MenuItemProps = {
  icon?: ReactNode;
  label: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  active?: boolean;
  className?: string;
};

export function MenuItem({ icon, label, rightIcon, onClick, danger, disabled, active, className }: MenuItemProps) {
  return (
    <button
      className={clsx(
        'menu-item',
        danger && 'menu-item-danger',
        disabled && 'menu-item-disabled',
        active && 'menu-item-active',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="menu-item-icon">{icon}</span>}
      <span className="menu-item-label">{label}</span>
      {rightIcon && <span className="menu-item-right">{rightIcon}</span>}
    </button>
  );
}

/* ── MenuSeparator ────────────────────────────────────────────── */

export type MenuSeparatorProps = {
  className?: string;
};

export function MenuSeparator({ className }: MenuSeparatorProps) {
  return <hr className={clsx('menu-separator', className)} />;
}

/* ── SubMenu ──────────────────────────────────────────────────── */

export type SubMenuProps = {
  icon?: ReactNode;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  placement?: 'right' | 'left';
  align?: 'start' | 'center' | 'end';
  offset?: number;
  closeDelay?: number;
};

export function SubMenu({
  icon,
  label,
  children,
  disabled,
  className,
  placement = 'right',
  align = 'start',
  offset = 0,
  closeDelay = 150,
}: SubMenuProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay]);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  return (
    <PopOver
      isOpen={open && !disabled}
      onClose={() => setOpen(false)}
      placement={placement}
      align={align}
      offset={offset}
      openDelay={0}
      trigger={
        <button
          className={clsx('menu-item', disabled && 'menu-item-disabled', className)}
          onMouseEnter={() => { cancelClose(); setOpen(true); }}
          onMouseLeave={() => scheduleClose()}
          disabled={disabled}
        >
          {icon && <span className="menu-item-icon">{icon}</span>}
          <span className="menu-item-label">{label}</span>
          <span className="menu-item-right">
            <Chevron direction="right" size={14} />
          </span>
        </button>
      }
    >
      <div
        className="menu-submenu-content"
        onMouseEnter={() => cancelClose()}
        onMouseLeave={() => scheduleClose()}
      >
        {children}
      </div>
    </PopOver>
  );
}
