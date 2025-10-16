import { CSSProperties, useEffect, useRef, type ReactNode, useCallback, useId } from 'react';
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
  const mountNodeRef = useRef<HTMLElement | null>(null);
  const prevOpenRef = useRef<boolean>(open);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

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

  if (!mountNodeRef.current || !isOpen) return null;

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
      data-open="true"
      data-top={isTop ? 'true' : 'false'}
      data-modal-id={modalId}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onClick={handleLayerClick}
    >
      <div
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

// Convenience wrapper component with common modal structure
export interface ModalWrapperProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  showCloseButton?: boolean;
  footer?: ReactNode;
  width?: CSSProperties['width'];
  maxWidth?: CSSProperties['maxWidth'];
  className?: string;
}

export const ModalWrapper = ({
  id,
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  footer,
  width = '500px',
  maxWidth = '90vw',
  className = ''
}: ModalWrapperProps) => {
  return (
    <Modal
      id={id}
      open={isOpen}
      onClose={onClose}
      ariaLabel={title}
      width={width}
      maxWidth={maxWidth}
      className={className}
    >
      {title && (
        <header className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {showCloseButton && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </header>
      )}

      <div className="modal-content">
        {children}
      </div>

      {footer && (
        <footer className="modal-footer">
          {footer}
        </footer>
      )}
    </Modal>
  );
};