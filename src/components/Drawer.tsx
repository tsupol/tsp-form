import { useEffect, useRef, useState, type ReactNode, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import "../styles/drawer.css";
import { useModal } from '../context/ModalContext';

type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

type DrawerProps = {
  id?: string;
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  side?: DrawerSide;
  className?: string;
  ariaLabel?: string;
};

export const Drawer = ({
  id,
  open,
  onClose,
  children,
  side = 'right',
  className = '',
  ariaLabel,
}: DrawerProps) => {
  const autoId = useId();
  const drawerId = id ?? autoId;
  const modalHook = useModal(drawerId);
  const { isOpen, isTop, zIndex } = modalHook;
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  const mountNodeRef = useRef<HTMLElement | null>(null);
  const prevOpenRef = useRef<boolean>(open);
  const prevIsOpenRef = useRef<boolean>(false);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create mount node
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const el = document.createElement('div');
    el.setAttribute('data-drawer-mount', drawerId);
    document.body.appendChild(el);
    mountNodeRef.current = el;

    return () => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };
  }, [drawerId]);

  // Sync open state with modal context
  useEffect(() => {
    if (prevOpenRef.current !== open) {
      prevOpenRef.current = open;

      if (open && !isOpen) {
        modalHook.open();
      } else if (!open && isOpen) {
        modalHook.close();
      }
    }
  }, [open, isOpen, modalHook.open, modalHook.close]);

  // Detect isOpen transition during render so closing is set before shouldRender check
  if (prevIsOpenRef.current && !isOpen && !closing) {
    setClosing(true);
    setVisible(false);
  }
  prevIsOpenRef.current = isOpen;

  // Trigger enter animation
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen]);

  // Handle exit animation completion
  useEffect(() => {
    if (!closing) return;

    const panel = panelRef.current;

    const finish = () => {
      if (closingTimeoutRef.current) {
        clearTimeout(closingTimeoutRef.current);
        closingTimeoutRef.current = null;
      }
      setClosing(false);
    };

    if (panel) {
      const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.target === panel) {
          finish();
        }
      };
      panel.addEventListener('transitionend', handleTransitionEnd);
      closingTimeoutRef.current = setTimeout(finish, 200);

      return () => {
        panel.removeEventListener('transitionend', handleTransitionEnd);
        if (closingTimeoutRef.current) {
          clearTimeout(closingTimeoutRef.current);
          closingTimeoutRef.current = null;
        }
      };
    } else {
      setClosing(false);
    }
  }, [closing]);

  // Handle escape key
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isTop) {
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
    }
  }, [isTop, onClose]);

  // Track mousedown target
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    mouseDownTargetRef.current = event.target;
  }, []);

  // Handle backdrop click
  const handleLayerClick = useCallback((event: React.MouseEvent) => {
    if (
      event.target === event.currentTarget &&
      mouseDownTargetRef.current === event.currentTarget &&
      isTop
    ) {
      onClose?.();
    }
    mouseDownTargetRef.current = null;
  }, [isTop, onClose]);

  // Prevent closing when clicking inside drawer panel
  const handlePanelClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const shouldRender = isOpen || closing;
  if (!mountNodeRef.current || !shouldRender) return null;

  return createPortal(
    <div
      className="modal-layer"
      style={{ zIndex }}
      data-open={visible ? 'true' : 'false'}
      data-top={isTop ? 'true' : 'false'}
      data-modal-id={drawerId}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onClick={handleLayerClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`drawer-panel ${className}`.trim()}
        data-side={side}
        tabIndex={-1}
        onClick={handlePanelClick}
      >
        {children}
      </div>
    </div>,
    mountNodeRef.current
  );
};
