import { useState, useEffect, useRef, type ReactNode, type RefObject } from 'react';
import clsx from 'clsx';
import '../styles/scroll-reveal.css';

export type ScrollRevealProps = {
  /** Ref to the sentinel element — content reveals when this scrolls out of view */
  sentinel: RefObject<Element | null>;
  /** Scroll container ref. Defaults to the sentinel's nearest scrollable ancestor. */
  root?: RefObject<Element | null>;
  /** Intersection threshold (0–1). Default 0 — reveals as soon as sentinel fully leaves. */
  threshold?: number;
  className?: string;
  children?: ReactNode;
};

export function ScrollReveal({
  sentinel,
  root,
  threshold = 0,
  className,
  children,
}: ScrollRevealProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      {
        root: root?.current ?? null,
        threshold,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sentinel, root, threshold]);

  // Mount immediately when visible; unmount after fade-out ends
  useEffect(() => {
    if (visible) {
      setMounted(true);
    } else if (mounted) {
      const el = spanRef.current;
      if (!el) { setMounted(false); return; }
      const handleEnd = () => setMounted(false);
      el.addEventListener('transitionend', handleEnd, { once: true });
      return () => el.removeEventListener('transitionend', handleEnd);
    }
  }, [visible]);

  return (
    <span
      ref={spanRef}
      className={clsx('scroll-reveal', visible && 'scroll-reveal-visible', className)}
      aria-hidden={!visible}
    >
      {mounted && children}
    </span>
  );
}
