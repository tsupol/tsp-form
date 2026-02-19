import { CSSProperties, useEffect, useRef, useState, type ReactNode, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import "../styles/modal.css";
import { useModal } from '../context/ModalContext';

type ModalProps = {
  id?: string;
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  maxWidth?: CSSProperties['maxWidth'];
  maxHeight?: CSSProperties['maxHeight'];
  style?: CSSProperties;
};

export const Modal = ({
  id,
  open,
  onClose,
  children,
  className = '',
  ariaLabel,
  width,
  height,
  maxWidth,
  maxHeight,
  style
}: ModalProps) => {
  const autoId = useId();
  const modalId = id ?? autoId;
  const modalHook = useModal(modalId);
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
    el.setAttribute('data-modal-mount', modalId);
    document.body.appendChild(el);
    mountNodeRef.current = el;

    return () => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };
  }, [modalId]);

  // Sync open state with modal context
  useEffect(() => {
    // Only sync if the open prop actually changed
    if (prevOpenRef.current !== open) {
      prevOpenRef.current = open;

      if (open && !isOpen) {
        modalHook.open();
      } else if (!open && isOpen) {
        modalHook.close();
      }
    }
  }, [open, isOpen, modalHook.open, modalHook.close]);

  // Trigger enter animation: flip visible on next frame so browser paints base state first
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Detect isOpen going from true → false to trigger closing animation
  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      setClosing(true);
    }
    prevIsOpenRef.current = isOpen;
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

    // Listen for transitionend on the panel
    if (panel) {
      const handleTransitionEnd = (e: TransitionEvent) => {
        if (e.target === panel) {
          finish();
        }
      };
      panel.addEventListener('transitionend', handleTransitionEnd);

      // Safety timeout in case transitionend doesn't fire
      closingTimeoutRef.current = setTimeout(finish, 200);

      return () => {
        panel.removeEventListener('transitionend', handleTransitionEnd);
        if (closingTimeoutRef.current) {
          clearTimeout(closingTimeoutRef.current);
          closingTimeoutRef.current = null;
        }
      };
    } else {
      // No panel ref, just unmount immediately
      setClosing(false);
    }
  }, [closing]);

  // Handle escape key for this specific modal
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isTop) {
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
    }
  }, [isTop, onClose]);

  // Track mousedown target to prevent closing when selecting text
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    mouseDownTargetRef.current = event.target;
  }, []);

  // Handle backdrop click on the modal layer
  const handleLayerClick = useCallback((event: React.MouseEvent) => {
    // Only close if this is the top modal, clicking the layer (not the panel),
    // and both mousedown and mouseup happened on the backdrop
    if (
      event.target === event.currentTarget &&
      mouseDownTargetRef.current === event.currentTarget &&
      isTop
    ) {
      onClose?.();
    }
    // Reset after handling click
    mouseDownTargetRef.current = null;
  }, [isTop, onClose]);

  // Prevent closing when clicking inside modal panel
  const handleModalClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
  }, []);

  const shouldRender = isOpen || closing;
  if (!mountNodeRef.current || !shouldRender) return null;

  const panelStyle: CSSProperties = {
    width,
    height,
    maxWidth,
    maxHeight,
    ...style
  };

  return createPortal(
    <div
      className="modal-layer"
      style={{ zIndex }}
      data-open={visible ? 'true' : 'false'}
      data-top={isTop ? 'true' : 'false'}
      data-modal-id={modalId}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onClick={handleLayerClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`modal-panel ${className}`.trim()}
        style={panelStyle}
        tabIndex={-1}
        onClick={handleModalClick}
      >
        {children}
      </div>
    </div>,
    mountNodeRef.current
  );
};

