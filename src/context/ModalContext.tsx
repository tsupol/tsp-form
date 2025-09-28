import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef
} from "react";
import { createPortal } from 'react-dom';

type ModalState = {
  id: string;
  zIndex: number;
};

type ModalContextValue = {
  stack: ModalState[];
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  closeAll: () => void;
  closeTop: () => void;
  isOpen: (id: string) => boolean;
  isTop: (id: string) => boolean;
  getZIndex: (id: string) => number;
  hasModals: boolean;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export interface ModalProviderProps {
  children: ReactNode;
  baseZIndex?: number;
  bodyClassName?: string;
}

export const ModalProvider = ({
  children,
  baseZIndex = 1000,
  bodyClassName = "has-modal-open"
}: ModalProviderProps) => {
  const [stack, setStack] = useState<ModalState[]>([]);
  const backdropMountRef = useRef<HTMLElement | null>(null);

  // Create backdrop mount point
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const backdropMount = document.createElement('div');
    backdropMount.className = 'modal-backdrop-mount';
    backdropMount.style.position = 'fixed';
    backdropMount.style.inset = '0';
    backdropMount.style.pointerEvents = 'none';
    // Backdrop z-index is always one level below the top modal
    backdropMount.style.zIndex = (baseZIndex - 1).toString();
    document.body.appendChild(backdropMount);
    backdropMountRef.current = backdropMount;

    return () => {
      if (backdropMount.parentNode) {
        backdropMount.parentNode.removeChild(backdropMount);
      }
    };
  }, [baseZIndex]);

  // Update backdrop z-index when stack changes
  useEffect(() => {
    if (backdropMountRef.current && stack.length > 0) {
      // Backdrop should be below the top modal but above all other modals
      // Top modal gets the highest z-index, backdrop gets second highest
      const topModalZIndex = baseZIndex + stack.length;
      const backdropZIndex = topModalZIndex - 1;
      backdropMountRef.current.style.zIndex = backdropZIndex.toString();
    }
  }, [stack.length, baseZIndex]);

  const openModal = useCallback((id: string) => {
    if (!id) return;

    setStack(prev => {
      // Don't add if already open
      if (prev.some(modal => modal.id === id)) {
        return prev;
      }

      const newModal: ModalState = {
        id,
        zIndex: baseZIndex + prev.length + 1
      };

      return [...prev, newModal];
    });
  }, [baseZIndex]);

  const closeModal = useCallback((id: string) => {
    setStack(prev => {
      const modalIndex = prev.findIndex(modal => modal.id === id);
      if (modalIndex === -1) return prev;

      // Remove the modal and recalculate z-indices
      const newStack = prev.filter(modal => modal.id !== id);
      return newStack.map((modal, index) => ({
        ...modal,
        zIndex: baseZIndex + index + 1
      }));
    });
  }, [baseZIndex]);

  const closeAll = useCallback(() => {
    setStack([]);
  }, []);

  const closeTop = useCallback(() => {
    setStack(prev => prev.slice(0, -1));
  }, []);

  const isOpen = useCallback((id: string) => {
    return stack.some(modal => modal.id === id);
  }, [stack]);

  const isTop = useCallback((id: string) => {
    const topModal = stack[stack.length - 1];
    return topModal?.id === id;
  }, [stack]);

  const getZIndex = useCallback((id: string) => {
    const modal = stack.find(m => m.id === id);
    return modal?.zIndex ?? baseZIndex;
  }, [stack, baseZIndex]);

  const hasModals = stack.length > 0;

  // Handle body class and scroll lock
  useEffect(() => {
    if (typeof document === "undefined") return;

    const body = document.body;

    if (hasModals) {
      const originalOverflow = body.style.overflow;
      const originalPaddingRight = body.style.paddingRight;

      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      body.classList.add(bodyClassName);
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        body.classList.remove(bodyClassName);
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight;
      };
    } else {
      body.classList.remove(bodyClassName);
      body.style.overflow = "";
      body.style.paddingRight = "";
    }
  }, [hasModals, bodyClassName]);

  // Handle backdrop click to close top modal
  const handleBackdropClick = useCallback(() => {
    if (hasModals) {
      closeTop();
    }
  }, [hasModals, closeTop]);

  // Global escape key handler
  useEffect(() => {
    if (!hasModals) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeTop();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [hasModals, closeTop]);

  const contextValue = useMemo<ModalContextValue>(() => ({
    stack,
    openModal,
    closeModal,
    closeAll,
    closeTop,
    isOpen,
    isTop,
    getZIndex,
    hasModals
  }), [
    stack,
    openModal,
    closeModal,
    closeAll,
    closeTop,
    isOpen,
    isTop,
    getZIndex,
    hasModals
  ]);

  return (
    <ModalContext.Provider value={contextValue}>
      {children}

      {/* Single global backdrop */}
      {backdropMountRef.current && hasModals && createPortal(
        <div
          className="modal-global-backdrop"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />,
        backdropMountRef.current
      )}
    </ModalContext.Provider>
  );
};

export interface UseModalReturn {
  isOpen: boolean;
  isTop: boolean;
  zIndex: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useModal = (id: string): UseModalReturn => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within ModalProvider");
  }

  if (!id) {
    throw new Error("Modal ID is required");
  }

  const { openModal, closeModal, isOpen: ctxIsOpen, isTop: ctxIsTop, getZIndex } = ctx;

  const isOpen = ctxIsOpen(id);
  const isTop = ctxIsTop(id);
  const zIndex = getZIndex(id);

  const open = useCallback(() => {
    openModal(id);
  }, [openModal, id]);

  const close = useCallback(() => {
    closeModal(id);
  }, [closeModal, id]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return { isOpen, isTop, zIndex, open, close, toggle };
};

export const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModalContext must be used within ModalProvider");
  }
  return ctx;
};