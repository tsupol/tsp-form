"use client"
import React, { CSSProperties, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../context/ModalContext';
import "../styles/modal.css";

type ModalProps = {
  id: string;
  open: boolean;
  onClose?: () => void;
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
  className?: string;
  backdropClassName?: string;
  ariaLabel?: string;
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  minWidth?: CSSProperties['minWidth'];
  maxWidth?: CSSProperties['maxWidth'];
  minHeight?: CSSProperties['minHeight'];
  maxHeight?: CSSProperties['maxHeight'];
  style?: React.CSSProperties;
};

const Z_BASE = 1000;
const Z_STEP = 10;

export const Modal: React.FC<ModalProps> = ({
                                              id,
                                              open,
                                              onClose,
                                              closeOnBackdrop = true,
                                              children,
                                              className,
                                              backdropClassName,
                                              ariaLabel,
                                              width = '38rem',
                                              height,
                                              minWidth,
                                              maxWidth = 'calc(100vw - 2rem)',
                                              minHeight,
                                              maxHeight,
                                              style
                                            }) => {
  const mountNode = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (mountNode.current || typeof document === 'undefined') return;
    const el = document.createElement('div');
    el.setAttribute('data-modal-layer', id);
    document.body.appendChild(el);
    mountNode.current = el;
    return () => {
      el.remove();
    };
  }, [id]);

  const { isTop, index } = useModal(id, open);
  const zIndex = useMemo(
    () => (index >= 0 ? Z_BASE + index * Z_STEP : Z_BASE),
    [index]
  );

  const handleBackdrop = () => {
    if (isTop && closeOnBackdrop) onClose?.();
  };

  if (!mountNode.current) return null;

  const panelStyle: React.CSSProperties = {
    width,
    height,
    minWidth,
    minHeight,
    // cap to viewport
    maxWidth: maxWidth ?? '100vw',
    maxHeight: maxHeight ?? '100vh',
    ...style
  };

  return createPortal(
    <div
      className="modal-layer"
      style={{ zIndex }}
      data-open={open ? 'true' : 'false'}
      data-top={isTop ? 'true' : 'false'}
      aria-hidden={!open}
    >
      <div
        className={`modal-backdrop ${backdropClassName ?? ''}`}
        onClick={handleBackdrop}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`modal-panel ${className ?? ''}`}
        style={panelStyle}
      >
        {children}
      </div>
    </div>,
    mountNode.current
  );
};

