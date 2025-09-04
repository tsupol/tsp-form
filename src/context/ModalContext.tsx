// src/context/ModalContext.tsx
"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Ctx = {
  stack: string[];
  setOpen: (id: string, open: boolean) => void;
  unregister: (id: string) => void;
  isTop: (id: string) => boolean;
  indexOf: (id: string) => number;
};

const ModalContext = createContext<Ctx | null>(null);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<string[]>([]);

  const setOpen = useCallback((id: string, open: boolean) => {
    setStack(prev => {
      const has = prev.includes(id);
      if (open && !has) return [...prev, id];
      if (!open && has) return prev.filter(x => x !== id);
      return prev;
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setStack(prev => prev.filter(x => x !== id));
  }, []);

  const isTop = useCallback((id: string) => stack[stack.length - 1] === id, [stack]);
  const indexOf = useCallback((id: string) => stack.indexOf(id), [stack]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (stack.length > 0) document.body.classList.add("has-modal-open");
    else document.body.classList.remove("has-modal-open");
  }, [stack.length]);

  const value = useMemo<Ctx>(() => ({ stack, setOpen, unregister, isTop, indexOf }), [stack, setOpen, unregister, isTop, indexOf]);

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModal = (id: string, open: boolean) => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  const { setOpen, unregister, isTop, indexOf } = ctx;

  useEffect(() => {
    setOpen(id, open);
    return () => unregister(id);
  }, [id, open, setOpen, unregister]);

  return { isTop: isTop(id), index: indexOf(id) };
};