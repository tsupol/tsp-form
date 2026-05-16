import {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { clsx } from 'clsx';
import '../styles/image-zoom-pan.css';

export interface ImageZoomPanHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  getScale: () => number;
}

export type ImageFit = 'contain' | 'cover';
export type WheelMode = 'always' | 'modifier' | 'when-zoomed';
export type DesktopZoomTrigger = 'click' | 'double-click' | 'none';

export interface ImageZoomPanProps {
  src: string;
  alt?: string;
  aspectRatio?: number;
  imageFit?: ImageFit;
  minZoom?: number;
  maxZoom?: number;
  doubleClickZoom?: number;
  rubberBand?: boolean;
  rubberBandMin?: number;
  wheelZoom?: WheelMode;
  wheelSessionTimeout?: number;
  desktopZoomTrigger?: DesktopZoomTrigger;
  className?: string;
  style?: CSSProperties;
  onZoomChange?: (scale: number) => void;
}

type Transform = { x: number; y: number; scale: number };

const INERTIA_AMPLITUDE = 0.25;
const INERTIA_TIME_CONSTANT = 342;
const INERTIA_MIN_VELOCITY = 5;
const WHEEL_SPEED = 0.065;
const PINCH_SPEED = 1;
const DRAG_THRESHOLD = 4;
const DOUBLE_TAP_MS = 300;
const ANIM_DURATION = 200;

export const ImageZoomPan = forwardRef<ImageZoomPanHandle, ImageZoomPanProps>(({
  src,
  alt = '',
  aspectRatio,
  imageFit = 'contain',
  minZoom = 1,
  maxZoom = 8,
  doubleClickZoom = 2,
  rubberBand = false,
  rubberBandMin = 0.5,
  wheelZoom = 'when-zoomed',
  wheelSessionTimeout = 500,
  desktopZoomTrigger = 'double-click',
  className,
  style,
  onZoomChange,
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(null);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  const transformRef = useRef<Transform>({ x: 0, y: 0, scale: 1 });
  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;

  // Imperative handle calls these — they're set inside the effect once mounted.
  const apiRef = useRef<{
    animateTo: (cx: number, cy: number, targetScale: number) => void;
  } | null>(null);

  const effectiveMinZoom = rubberBand ? rubberBandMin : minZoom;

  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !imgSize) return;

    // ===== State =====
    let raf = 0;
    let animRaf = 0;
    let lastReportedScale = 1;

    let panning = false;
    let pinching = false;
    let touchActive = false;
    let mouseActive = false;
    let movedPastThreshold = false;

    // Pointer tracking (shared by touch + mouse pan)
    let prevX = 0;
    let prevY = 0;

    // Velocity tracking for inertia
    let lastSampleTime = 0;
    let vx = 0;
    let vy = 0;
    let trackerRaf = 0;

    // Double-tap (touch)
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;

    // Pinch state
    let pinchStartDist = 0;
    let pinchStartScale = 1;

    // Suppress synthetic mouse events on touch devices
    let lastTouchTime = 0;

    // Wheel session: while active, wheel events stay claimed by the component
    // even after scale drops to baseline. Without rubberBand, ends on idle
    // timeout. With rubberBand, ends only on mouseleave.
    let wheelActive = false;
    let wheelIdleTimer = 0;
    let leaveSnapTimer = 0;

    // ===== Transform helpers =====
    const rect = () => container.getBoundingClientRect();

    const apply = () => {
      const t = transformRef.current;
      img.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.scale})`;
      if (Math.abs(t.scale - lastReportedScale) > 0.001) {
        lastReportedScale = t.scale;
        onZoomChangeRef.current?.(t.scale);
      }
    };

    const scheduleApply = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };

    // Clamp pan so the image edges can't move inside the container edges.
    // At scale <= 1 (fit=contain), the image is smaller than the container —
    // maxX/Y collapse to 0, locking the image centered.
    const clamp = (t: Transform): Transform => {
      const r = rect();
      const w = imgSize.w * t.scale;
      const h = imgSize.h * t.scale;
      const maxX = Math.max(0, (w - r.width) / 2);
      const maxY = Math.max(0, (h - r.height) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, t.x)),
        y: Math.max(-maxY, Math.min(maxY, t.y)),
        scale: t.scale,
      };
    };

    const setTransform = (next: Transform) => {
      transformRef.current = clamp(next);
      scheduleApply();
    };

    // Zoom at a screen point so the point under the cursor/finger stays put.
    const zoomAt = (clientX: number, clientY: number, multiplier: number) => {
      const t = transformRef.current;
      const r = rect();
      const cx = clientX - r.left - r.width / 2;
      const cy = clientY - r.top - r.height / 2;

      const newScale = Math.max(effectiveMinZoom, Math.min(maxZoom, t.scale * multiplier));
      const m = newScale / t.scale;
      setTransform({
        x: cx * (1 - m) + t.x * m,
        y: cy * (1 - m) + t.y * m,
        scale: newScale,
      });
    };

    const cancelAnim = () => {
      if (animRaf) {
        cancelAnimationFrame(animRaf);
        animRaf = 0;
      }
    };

    const animateTo = (clientX: number, clientY: number, targetScale: number) => {
      cancelAnim();
      const start = { ...transformRef.current };
      const t0 = performance.now();
      const step = () => {
        const elapsed = performance.now() - t0;
        const p = Math.min(1, elapsed / ANIM_DURATION);
        const eased = 1 - Math.pow(1 - p, 3);
        const s = start.scale + (targetScale - start.scale) * eased;
        const m = s / start.scale;
        const r = rect();
        const cx = clientX - r.left - r.width / 2;
        const cy = clientY - r.top - r.height / 2;
        setTransform({
          x: cx * (1 - m) + start.x * m,
          y: cy * (1 - m) + start.y * m,
          scale: s,
        });
        animRaf = p < 1 ? requestAnimationFrame(step) : 0;
      };
      animRaf = requestAnimationFrame(step);
    };
    apiRef.current = { animateTo };

    const animateBackToBase = () => {
      if (Math.abs(transformRef.current.scale - minZoom) < 0.001) return false;
      const r = rect();
      animateTo(r.left + r.width / 2, r.top + r.height / 2, minZoom);
      return true;
    };

    // ===== Velocity tracking (for pan inertia) =====
    const startTracking = () => {
      vx = vy = 0;
      lastSampleTime = performance.now();
      cancelAnimationFrame(trackerRaf);
      let lastX = prevX;
      let lastY = prevY;
      const tick = () => {
        const now = performance.now();
        const elapsed = now - lastSampleTime;
        lastSampleTime = now;
        const dx = prevX - lastX;
        const dy = prevY - lastY;
        lastX = prevX;
        lastY = prevY;
        const dt = 1000 / (1 + elapsed);
        vx = 0.8 * dx * dt + 0.2 * vx;
        vy = 0.8 * dy * dt + 0.2 * vy;
        trackerRaf = requestAnimationFrame(tick);
      };
      trackerRaf = requestAnimationFrame(tick);
    };

    const stopTracking = () => {
      cancelAnimationFrame(trackerRaf);
      trackerRaf = 0;
    };

    const startInertia = () => {
      if (Math.abs(vx) < INERTIA_MIN_VELOCITY && Math.abs(vy) < INERTIA_MIN_VELOCITY) return;
      const ax = INERTIA_AMPLITUDE * vx;
      const ay = INERTIA_AMPLITUDE * vy;
      const start = { ...transformRef.current };
      const t0 = performance.now();
      const step = () => {
        const elapsed = performance.now() - t0;
        const decay = Math.exp(-elapsed / INERTIA_TIME_CONSTANT);
        setTransform({
          x: start.x + ax * (1 - decay),
          y: start.y + ay * (1 - decay),
          scale: start.scale,
        });
        const remaining = Math.max(Math.abs(ax * decay), Math.abs(ay * decay));
        animRaf = remaining > 0.5 ? requestAnimationFrame(step) : 0;
      };
      animRaf = requestAnimationFrame(step);
    };

    // ===== State queries =====
    const isZoomed = () => transformRef.current.scale > minZoom + 0.001;

    const isPannable = () => {
      if (isZoomed()) return true;
      const r = rect();
      const w = imgSize.w * transformRef.current.scale;
      const h = imgSize.h * transformRef.current.scale;
      return w > r.width + 1 || h > r.height + 1;
    };

    // ===== Touch =====
    const onTouchStart = (e: TouchEvent) => {
      lastTouchTime = performance.now();
      cancelAnim();

      if (e.touches.length === 1) {
        const t = e.touches[0];
        prevX = t.clientX;
        prevY = t.clientY;
        movedPastThreshold = false;
        touchActive = true;
        if (isPannable()) startTracking();
      } else if (e.touches.length === 2) {
        e.preventDefault();
        touchActive = true;
        pinching = true;
        panning = false;
        stopTracking();
        const [t1, t2] = [e.touches[0], e.touches[1]];
        pinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        pinchStartScale = transformRef.current.scale;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive) return;

      if (e.touches.length === 2 && pinching) {
        e.preventDefault();
        const [t1, t2] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const target = pinchStartScale * (1 + (dist / pinchStartDist - 1) * PINCH_SPEED);
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        zoomAt(midX, midY, target / transformRef.current.scale);
        return;
      }

      if (e.touches.length === 1) {
        const t = e.touches[0];

        if (!movedPastThreshold) {
          if (Math.hypot(t.clientX - prevX, t.clientY - prevY) < DRAG_THRESHOLD) return;
          movedPastThreshold = true;
          if (!isPannable()) {
            // Single-finger drag at scale=1 → release to browser (page scroll).
            touchActive = false;
            return;
          }
          panning = true;
          prevX = t.clientX;
          prevY = t.clientY;
          startTracking();
          return;
        }

        if (panning) {
          e.preventDefault();
          const dx = t.clientX - prevX;
          const dy = t.clientY - prevY;
          prevX = t.clientX;
          prevY = t.clientY;
          const cur = transformRef.current;
          setTransform({ x: cur.x + dx, y: cur.y + dy, scale: cur.scale });
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchActive) return;

      // Double-tap (only on a tap, not a pan/pinch)
      if (e.touches.length === 0 && !panning && !pinching) {
        const now = performance.now();
        const t = e.changedTouches[0];
        if (now - lastTapTime < DOUBLE_TAP_MS && Math.hypot(t.clientX - lastTapX, t.clientY - lastTapY) < 20) {
          lastTapTime = 0;
          animateTo(t.clientX, t.clientY, isZoomed() ? minZoom : doubleClickZoom);
        } else {
          lastTapTime = now;
          lastTapX = t.clientX;
          lastTapY = t.clientY;
        }
      }

      if (e.touches.length === 0) {
        const wasPanning = panning;
        touchActive = panning = pinching = false;
        stopTracking();
        // On full release, rubber-band snaps back to base scale. Otherwise apply
        // pan inertia if we were panning.
        const snapped = rubberBand && animateBackToBase();
        if (!snapped && wasPanning) startInertia();
      } else if (e.touches.length === 1 && pinching) {
        // Pinch → single-finger pan transition.
        pinching = false;
        const t = e.touches[0];
        prevX = t.clientX;
        prevY = t.clientY;
        panning = true;
        startTracking();
      }
    };

    // ===== Mouse pan =====
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || !isPannable()) return;
      e.preventDefault();
      cancelAnim();
      mouseActive = true;
      panning = true;
      prevX = e.clientX;
      prevY = e.clientY;
      movedPastThreshold = false;
      startTracking();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseActive) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) movedPastThreshold = true;
      const cur = transformRef.current;
      setTransform({ x: cur.x + dx, y: cur.y + dy, scale: cur.scale });
    };

    const onMouseUp = () => {
      if (!mouseActive) return;
      mouseActive = false;
      panning = false;
      stopTracking();
      startInertia();
    };

    // ===== Wheel =====
    const cancelLeaveSnap = () => {
      if (leaveSnapTimer) {
        clearTimeout(leaveSnapTimer);
        leaveSnapTimer = 0;
      }
    };

    const onWheel = (e: WheelEvent) => {
      let allow = false;
      if (wheelZoom === 'always') allow = true;
      else if (wheelZoom === 'modifier') allow = e.ctrlKey || e.metaKey;
      else if (wheelZoom === 'when-zoomed') {
        allow = wheelActive || isPannable() || e.ctrlKey || e.metaKey;
      }
      if (!allow) return;

      wheelActive = true;
      e.preventDefault();
      cancelAnim();
      cancelLeaveSnap();

      let delta = e.deltaY;
      if (e.deltaMode > 0) delta *= 100;
      const sign = Math.sign(delta);
      const step = Math.min(0.25, Math.abs(WHEEL_SPEED * delta / 128));
      zoomAt(e.clientX, e.clientY, 1 - sign * step);

      // Without rubberBand, end the session after idle so page scroll can resume.
      // With rubberBand, the session ends only on mouseleave.
      if (!rubberBand) {
        if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
        wheelIdleTimer = window.setTimeout(() => {
          wheelIdleTimer = 0;
          wheelActive = false;
        }, wheelSessionTimeout);
      }
    };

    // ===== Click / double-click (desktop only) =====
    const fromTouch = () => performance.now() - lastTouchTime < 500;

    const toggleZoom = (clientX: number, clientY: number) => {
      cancelAnim();
      animateTo(clientX, clientY, isZoomed() ? minZoom : doubleClickZoom);
    };

    const onClick = (e: MouseEvent) => {
      if (fromTouch() || movedPastThreshold) return;
      e.preventDefault();
      toggleZoom(e.clientX, e.clientY);
    };

    const onDoubleClick = (e: MouseEvent) => {
      if (fromTouch()) return;
      e.preventDefault();
      toggleZoom(e.clientX, e.clientY);
    };

    // ===== Mouseleave / enter (rubberBand snap-back trigger) =====
    const onMouseLeave = () => {
      if (!rubberBand) return;
      cancelLeaveSnap();
      leaveSnapTimer = window.setTimeout(() => {
        leaveSnapTimer = 0;
        wheelActive = false;
        animateBackToBase();
      }, wheelSessionTimeout);
    };

    const onMouseEnter = () => cancelLeaveSnap();

    // ===== Wire up =====
    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd, { passive: false });
    container.addEventListener('touchcancel', onTouchEnd, { passive: false });
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mouseenter', onMouseEnter);
    if (desktopZoomTrigger === 'click') container.addEventListener('click', onClick);
    else if (desktopZoomTrigger === 'double-click') container.addEventListener('dblclick', onDoubleClick);

    apply();

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('click', onClick);
      container.removeEventListener('dblclick', onDoubleClick);
      if (raf) cancelAnimationFrame(raf);
      if (animRaf) cancelAnimationFrame(animRaf);
      if (trackerRaf) cancelAnimationFrame(trackerRaf);
      if (wheelIdleTimer) clearTimeout(wheelIdleTimer);
      if (leaveSnapTimer) clearTimeout(leaveSnapTimer);
      apiRef.current = null;
    };
  }, [imgSize, minZoom, maxZoom, doubleClickZoom, rubberBand, rubberBandMin, wheelZoom, wheelSessionTimeout, effectiveMinZoom, desktopZoomTrigger]);

  // Measure image natural size + fit it to the container's aspect ratio.
  useEffect(() => {
    if (!imgNatural) return;
    const container = containerRef.current;
    if (!container) return;

    const compute = () => {
      const r = container.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      const containerRatio = r.width / r.height;
      const imgRatio = imgNatural.w / imgNatural.h;
      const useWidth =
        imageFit === 'contain' ? imgRatio > containerRatio : imgRatio <= containerRatio;
      const w = useWidth ? r.width : r.height * imgRatio;
      const h = useWidth ? r.width / imgRatio : r.height;
      setImgSize({ w, h });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [imgNatural, imageFit]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const c = containerRef.current;
      if (!c || !apiRef.current) return;
      const r = c.getBoundingClientRect();
      apiRef.current.animateTo(r.left + r.width / 2, r.top + r.height / 2,
        Math.min(maxZoom, transformRef.current.scale * 1.5));
    },
    zoomOut: () => {
      const c = containerRef.current;
      if (!c || !apiRef.current) return;
      const r = c.getBoundingClientRect();
      apiRef.current.animateTo(r.left + r.width / 2, r.top + r.height / 2,
        Math.max(minZoom, transformRef.current.scale / 1.5));
    },
    reset: () => {
      const c = containerRef.current;
      if (!c || !apiRef.current) return;
      const r = c.getBoundingClientRect();
      apiRef.current.animateTo(r.left + r.width / 2, r.top + r.height / 2, 1);
    },
    getScale: () => transformRef.current.scale,
  }), [maxZoom, minZoom]);

  const containerStyle: CSSProperties = {
    aspectRatio: aspectRatio !== undefined ? `${aspectRatio}` : undefined,
    ...style,
  };

  const imgStyle: CSSProperties = imgSize
    ? { width: imgSize.w, height: imgSize.h }
    : { visibility: 'hidden' };

  return (
    <div
      ref={containerRef}
      className={clsx('image-zoom-pan', className)}
      style={containerStyle}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="image-zoom-pan-img"
        style={imgStyle}
        draggable={false}
        onLoad={(e) => {
          const t = e.currentTarget;
          setImgNatural({ w: t.naturalWidth, h: t.naturalHeight });
        }}
      />
    </div>
  );
});

ImageZoomPan.displayName = 'ImageZoomPan';
