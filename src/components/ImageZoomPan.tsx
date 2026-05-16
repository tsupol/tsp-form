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

  const effectiveMinZoom = rubberBand ? rubberBandMin : minZoom;

  // Apply transform directly to DOM. Skip React state for hot path.
  useEffect(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img || !imgSize) return;

    let raf = 0;
    let lastReportedScale = 1;
    let panning = false;
    let pinching = false;

    // Velocity tracker for inertia
    let lastTrackTime = 0;
    let lastTrackX = 0;
    let lastTrackY = 0;
    let vx = 0;
    let vy = 0;
    let trackTicker = 0;
    let inertiaRaf = 0;

    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerLastX = 0;
    let pointerLastY = 0;
    let touchActive = false;
    let mouseActive = false;
    let movedPastThreshold = false;
    let lastTapTime = 0;
    let lastTapX = 0;
    let lastTapY = 0;
    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let pinchStartMidpoint = { x: 0, y: 0 };
    let lastTouchTime = 0;

    const applyTransform = () => {
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
        applyTransform();
      });
    };

    const getContainerRect = () => container.getBoundingClientRect();

    // Clamp transform so the image always covers the container (when scale > fit)
    // or stays centered (when scale = 1). At scale=1 with imageFit=contain the
    // image is already smaller than container — we keep it centered (x=y=0).
    // At scale>1 we clamp so the image edges can't go inside the container edges.
    const clampTransform = (t: Transform, allowOverflow = false): Transform => {
      const rect = getContainerRect();
      const imgW = imgSize.w * t.scale;
      const imgH = imgSize.h * t.scale;

      // At scale 1 the image is sized to fit; center any residual.
      // Translation is relative to the image's centered position via transform-origin.
      // We treat the image as positioned at (0,0) inside container then translated.
      // The image is centered by flex layout, so transform x/y are deltas from center.
      let x = t.x;
      let y = t.y;

      const maxX = Math.max(0, (imgW - rect.width) / 2);
      const maxY = Math.max(0, (imgH - rect.height) / 2);

      if (!allowOverflow) {
        if (x > maxX) x = maxX;
        if (x < -maxX) x = -maxX;
        if (y > maxY) y = maxY;
        if (y < -maxY) y = -maxY;
      }

      return { x, y, scale: t.scale };
    };

    const setTransform = (next: Transform, allowOverflow = false) => {
      transformRef.current = clampTransform(next, allowOverflow);
      scheduleApply();
    };

    const zoomAt = (clientX: number, clientY: number, scaleMultiplier: number, floor = effectiveMinZoom) => {
      const t = transformRef.current;
      const rect = getContainerRect();

      // Container-local coords (relative to container center, since img is flex-centered)
      const cx = clientX - rect.left - rect.width / 2;
      const cy = clientY - rect.top - rect.height / 2;

      let newScale = t.scale * scaleMultiplier;
      newScale = Math.max(floor, Math.min(maxZoom, newScale));
      const actualMultiplier = newScale / t.scale;

      // Keep the point under the cursor stationary:
      // (cx - x) is the image-local coord at scale t.scale.
      // After scaling by m: new offset of that point = (cx - x) * m
      // We want new screen position = cx, so: cx = newX + (cx - x) * m
      // => newX = cx - (cx - x) * m = cx * (1 - m) + x * m
      const newX = cx * (1 - actualMultiplier) + t.x * actualMultiplier;
      const newY = cy * (1 - actualMultiplier) + t.y * actualMultiplier;

      setTransform({ x: newX, y: newY, scale: newScale }, rubberBand && newScale < minZoom);
    };

    const cancelInertia = () => {
      if (inertiaRaf) {
        cancelAnimationFrame(inertiaRaf);
        inertiaRaf = 0;
      }
    };

    const startVelocityTracking = () => {
      vx = 0;
      vy = 0;
      lastTrackTime = performance.now();
      lastTrackX = pointerLastX;
      lastTrackY = pointerLastY;
      cancelAnimationFrame(trackTicker);
      const tick = () => {
        const now = performance.now();
        const elapsed = now - lastTrackTime;
        lastTrackTime = now;
        const dx = pointerLastX - lastTrackX;
        const dy = pointerLastY - lastTrackY;
        lastTrackX = pointerLastX;
        lastTrackY = pointerLastY;
        const dt = 1000 / (1 + elapsed);
        vx = 0.8 * dx * dt + 0.2 * vx;
        vy = 0.8 * dy * dt + 0.2 * vy;
        trackTicker = requestAnimationFrame(tick);
      };
      trackTicker = requestAnimationFrame(tick);
    };

    const stopVelocityTracking = () => {
      cancelAnimationFrame(trackTicker);
      trackTicker = 0;
    };

    const startInertia = () => {
      if (Math.abs(vx) < INERTIA_MIN_VELOCITY && Math.abs(vy) < INERTIA_MIN_VELOCITY) return;
      const ax = INERTIA_AMPLITUDE * vx;
      const ay = INERTIA_AMPLITUDE * vy;
      const start = performance.now();
      const startTransform = { ...transformRef.current };

      const animate = () => {
        const elapsed = performance.now() - start;
        const decay = Math.exp(-elapsed / INERTIA_TIME_CONSTANT);
        const dx = ax * (1 - decay);
        const dy = ay * (1 - decay);
        const next = clampTransform({
          x: startTransform.x + dx,
          y: startTransform.y + dy,
          scale: startTransform.scale,
        });
        // Stop if clamped to same value twice (hit wall) or decay nearly done
        const moveLeftX = Math.abs(ax * decay);
        const moveLeftY = Math.abs(ay * decay);
        transformRef.current = next;
        scheduleApply();
        if (moveLeftX > 0.5 || moveLeftY > 0.5) {
          inertiaRaf = requestAnimationFrame(animate);
        } else {
          inertiaRaf = 0;
        }
      };
      inertiaRaf = requestAnimationFrame(animate);
    };

    // Always-snap (for touch pinch): return to scale=minZoom on release regardless of current scale.
    const snapBackAlways = () => {
      if (!rubberBand) return false;
      const t = transformRef.current;
      if (Math.abs(t.scale - minZoom) < 0.001) return false;
      const rect = getContainerRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      animateScaleTo(cx, cy, minZoom);
      return true;
    };

    // Safety snap (for wheel): if user under-zoomed past minZoom (rubberBand's
    // bigger range, or the small built-in overscroll floor), spring back.
    const snapBackIfUnderzoom = () => {
      const t = transformRef.current;
      if (t.scale >= minZoom - 0.001) return false;
      const rect = getContainerRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      animateScaleTo(cx, cy, minZoom);
      return true;
    };

    const animateScaleTo = (clientX: number, clientY: number, targetScale: number) => {
      cancelInertia();
      const startTransform = { ...transformRef.current };
      const startTime = performance.now();
      const duration = 200;
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const scaleNow = startTransform.scale + (targetScale - startTransform.scale) * eased;
        const m = scaleNow / startTransform.scale;
        const rect = getContainerRect();
        const cx = clientX - rect.left - rect.width / 2;
        const cy = clientY - rect.top - rect.height / 2;
        const nx = cx * (1 - m) + startTransform.x * m;
        const ny = cy * (1 - m) + startTransform.y * m;
        transformRef.current = clampTransform({ x: nx, y: ny, scale: scaleNow });
        scheduleApply();
        if (progress < 1) {
          inertiaRaf = requestAnimationFrame(animate);
        } else {
          inertiaRaf = 0;
        }
      };
      inertiaRaf = requestAnimationFrame(animate);
    };

    // ===== Touch handlers =====
    // We never preventDefault on touchstart — that decision is deferred to touchmove
    // once we know what gesture the user is making.

    // "Pannable" = there's somewhere for the image to move. True when zoomed,
    // or when image overflows the container at scale 1 (cover fit).
    const isPannable = () => {
      if (transformRef.current.scale > minZoom + 0.001) return true;
      const rect = getContainerRect();
      const imgW = imgSize.w * transformRef.current.scale;
      const imgH = imgSize.h * transformRef.current.scale;
      return imgW > rect.width + 1 || imgH > rect.height + 1;
    };
    const isZoomed = () => transformRef.current.scale > minZoom + 0.001;

    const onTouchStart = (e: TouchEvent) => {
      lastTouchTime = performance.now();
      cancelInertia();
      if (e.touches.length === 1) {
        const t = e.touches[0];
        pointerStartX = pointerLastX = t.clientX;
        pointerStartY = pointerLastY = t.clientY;
        movedPastThreshold = false;
        touchActive = true;
        // Don't preventDefault yet — wait until we know it's a pan we should claim.
        if (isPannable()) startVelocityTracking();
      } else if (e.touches.length === 2) {
        // Pinch: we always claim this gesture
        e.preventDefault();
        touchActive = true;
        pinching = true;
        panning = false;
        stopVelocityTracking();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        pinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        pinchStartScale = transformRef.current.scale;
        pinchStartMidpoint = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        };
      }
    };

    let prevMoveX = 0;
    let prevMoveY = 0;

    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive) return;

      if (e.touches.length === 2 && pinching) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const ratio = dist / pinchStartDist;
        const multiplier = 1 + (ratio - 1) * PINCH_SPEED;
        const targetScale = pinchStartScale * multiplier;
        const midX = (t1.clientX + t2.clientX) / 2;
        const midY = (t1.clientY + t2.clientY) / 2;
        const stepMultiplier = targetScale / transformRef.current.scale;
        zoomAt(midX, midY, stepMultiplier);
        pinchStartMidpoint = { x: midX, y: midY };
        return;
      }

      if (e.touches.length === 1) {
        const t = e.touches[0];

        if (!movedPastThreshold) {
          const totalDx = t.clientX - pointerStartX;
          const totalDy = t.clientY - pointerStartY;
          if (Math.hypot(totalDx, totalDy) < DRAG_THRESHOLD) return;
          movedPastThreshold = true;

          if (!isPannable()) {
            // Release gesture to browser; never preventDefault.
            touchActive = false;
            return;
          }
          panning = true;
          prevMoveX = t.clientX;
          prevMoveY = t.clientY;
          startVelocityTracking();
          return;
        }

        if (panning) {
          e.preventDefault();
          const dx = t.clientX - prevMoveX;
          const dy = t.clientY - prevMoveY;
          prevMoveX = t.clientX;
          prevMoveY = t.clientY;
          pointerLastX = t.clientX;
          pointerLastY = t.clientY;
          const cur = transformRef.current;
          setTransform({ x: cur.x + dx, y: cur.y + dy, scale: cur.scale });
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchActive) return;

      // Double-tap detection (only when fully released)
      if (e.touches.length === 0 && !panning && !pinching) {
        const now = performance.now();
        const t = e.changedTouches[0];
        if (
          now - lastTapTime < DOUBLE_TAP_MS &&
          Math.hypot(t.clientX - lastTapX, t.clientY - lastTapY) < 20
        ) {
          // Double tap
          lastTapTime = 0;
          if (isZoomed()) {
            // Zoom out to 1
            animateScaleTo(t.clientX, t.clientY, minZoom);
          } else {
            animateScaleTo(t.clientX, t.clientY, doubleClickZoom);
          }
        } else {
          lastTapTime = now;
          lastTapX = t.clientX;
          lastTapY = t.clientY;
        }
      }

      if (e.touches.length === 0) {
        const wasPanning = panning;
        touchActive = false;
        panning = false;
        pinching = false;
        stopVelocityTracking();
        // On full release, always snap back to natural scale (rubber-band peek).
        // Snap takes priority over pan inertia.
        const snapped = snapBackAlways();
        if (!snapped && wasPanning) startInertia();
      } else if (e.touches.length === 1 && pinching) {
        // One finger released during pinch — drop to pan with remaining finger.
        // Don't snap-back yet; the user is still touching. Snap-back happens
        // when all fingers lift.
        pinching = false;
        const t = e.touches[0];
        prevMoveX = t.clientX;
        prevMoveY = t.clientY;
        panning = true;
        startVelocityTracking();
      }
    };

    // ===== Mouse handlers (desktop pan via drag) =====
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (!isPannable()) return; // Nothing to pan; let clicks pass through
      e.preventDefault();
      cancelInertia();
      mouseActive = true;
      panning = true;
      pointerStartX = pointerLastX = prevMoveX = e.clientX;
      pointerStartY = pointerLastY = prevMoveY = e.clientY;
      movedPastThreshold = false;
      startVelocityTracking();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseActive || !panning) return;
      const dx = e.clientX - prevMoveX;
      const dy = e.clientY - prevMoveY;
      prevMoveX = e.clientX;
      prevMoveY = e.clientY;
      pointerLastX = e.clientX;
      pointerLastY = e.clientY;
      const cur = transformRef.current;
      setTransform({ x: cur.x + dx, y: cur.y + dy, scale: cur.scale });
    };

    const onMouseUp = () => {
      if (!mouseActive) return;
      mouseActive = false;
      panning = false;
      stopVelocityTracking();
      startInertia();
    };

    // ===== Wheel =====
    let wheelEndTimer = 0;
    let wheelSessionActive = false;
    const onWheel = (e: WheelEvent) => {
      let allow = false;
      if (wheelZoom === 'always') allow = true;
      else if (wheelZoom === 'modifier') allow = e.ctrlKey || e.metaKey;
      else if (wheelZoom === 'when-zoomed') {
        // Once a wheel-zoom session starts, keep claiming wheel events until it
        // ends — otherwise wheeling out past scale=1 would hand the gesture to
        // the page mid-session, which feels broken.
        allow = wheelSessionActive || isPannable() || e.ctrlKey || e.metaKey;
      }
      if (!allow) return;
      wheelSessionActive = true;

      e.preventDefault();
      cancelInertia();
      // User is interacting — cancel any pending mouseleave snap-back.
      cancelLeaveSnap();

      let delta = e.deltaY;
      if (e.deltaMode > 0) delta *= 100;
      const sign = Math.sign(delta);
      const deltaAdjusted = Math.min(0.25, Math.abs(WHEEL_SPEED * delta / 128));
      const multiplier = 1 - sign * deltaAdjusted;
      zoomAt(e.clientX, e.clientY, multiplier);

      scheduleWheelEnd();
    };

    const scheduleWheelEnd = () => {
      // With rubberBand, the wheel session never ends on idle — it ends only
      // when the cursor leaves the container. Pausing mid-zoom must stay in
      // zoom mode so the next wheel keeps zooming instead of scrolling the page.
      if (rubberBand) return;
      if (wheelEndTimer) clearTimeout(wheelEndTimer);
      wheelEndTimer = window.setTimeout(() => {
        wheelEndTimer = 0;
        wheelSessionActive = false;
      }, wheelSessionTimeout);
    };

    let leaveSnapTimer = 0;
    const cancelLeaveSnap = () => {
      if (leaveSnapTimer) {
        clearTimeout(leaveSnapTimer);
        leaveSnapTimer = 0;
      }
    };

    // ===== Click / Double-click (desktop only) =====
    // Touch devices fire synthetic mouse events after touchend. Suppress those.
    const isFromTouch = () => performance.now() - lastTouchTime < 500;

    const handleZoomToggle = (clientX: number, clientY: number) => {
      cancelInertia();
      if (isZoomed()) {
        animateScaleTo(clientX, clientY, minZoom);
      } else {
        animateScaleTo(clientX, clientY, doubleClickZoom);
      }
    };

    const onClick = (e: MouseEvent) => {
      if (isFromTouch()) return;
      // Suppress click that follows a mouse-pan drag
      if (movedPastThreshold) return;
      e.preventDefault();
      handleZoomToggle(e.clientX, e.clientY);
    };

    const onDoubleClick = (e: MouseEvent) => {
      if (isFromTouch()) return;
      e.preventDefault();
      handleZoomToggle(e.clientX, e.clientY);
    };

    // Desktop rubber-band trigger: when the cursor leaves, schedule a snap-back
    // to scale 1 after `wheelSessionTimeout`. If the cursor returns within the
    // window, cancel the snap-back.
    const onMouseLeave = () => {
      if (!rubberBand) return;
      cancelLeaveSnap();
      leaveSnapTimer = window.setTimeout(() => {
        leaveSnapTimer = 0;
        if (wheelEndTimer) {
          clearTimeout(wheelEndTimer);
          wheelEndTimer = 0;
        }
        wheelSessionActive = false;
        snapBackAlways();
      }, wheelSessionTimeout);
    };

    const onMouseEnter = () => {
      cancelLeaveSnap();
    };

    // Attach listeners
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
    if (desktopZoomTrigger === 'click') {
      container.addEventListener('click', onClick);
    } else if (desktopZoomTrigger === 'double-click') {
      container.addEventListener('dblclick', onDoubleClick);
    }

    applyTransform();

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
      if (inertiaRaf) cancelAnimationFrame(inertiaRaf);
      if (trackTicker) cancelAnimationFrame(trackTicker);
      if (wheelEndTimer) clearTimeout(wheelEndTimer);
      if (leaveSnapTimer) clearTimeout(leaveSnapTimer);
    };
  }, [imgSize, minZoom, maxZoom, doubleClickZoom, rubberBand, rubberBandMin, wheelZoom, wheelSessionTimeout, effectiveMinZoom, desktopZoomTrigger]);

  // Measure image natural size + compute fitted size from container ratio
  useEffect(() => {
    if (!imgNatural) return;
    const container = containerRef.current;
    if (!container) return;

    const compute = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const containerRatio = rect.width / rect.height;
      const imgRatio = imgNatural.w / imgNatural.h;

      let w: number;
      let h: number;
      if (imageFit === 'contain') {
        if (imgRatio > containerRatio) {
          w = rect.width;
          h = rect.width / imgRatio;
        } else {
          h = rect.height;
          w = rect.height * imgRatio;
        }
      } else {
        if (imgRatio > containerRatio) {
          h = rect.height;
          w = rect.height * imgRatio;
        } else {
          w = rect.width;
          h = rect.width / imgRatio;
        }
      }
      setImgSize({ w, h });
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(container);
    return () => ro.disconnect();
  }, [imgNatural, imageFit]);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      animateScaleViaRef(cx, cy, Math.min(maxZoom, transformRef.current.scale * 1.5));
    },
    zoomOut: () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      animateScaleViaRef(cx, cy, Math.max(minZoom, transformRef.current.scale / 1.5));
    },
    reset: () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      animateScaleViaRef(cx, cy, 1);
    },
    getScale: () => transformRef.current.scale,
  }), [maxZoom, minZoom]);

  // External-facing animator that mirrors the internal one. Necessary because
  // the internal one closes over effect-scope state.
  const animateScaleViaRef = (clientX: number, clientY: number, targetScale: number) => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;
    const startTransform = { ...transformRef.current };
    const startTime = performance.now();
    const duration = 200;
    const step = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const scaleNow = startTransform.scale + (targetScale - startTransform.scale) * eased;
      const m = scaleNow / startTransform.scale;
      const rect = container.getBoundingClientRect();
      const cx = clientX - rect.left - rect.width / 2;
      const cy = clientY - rect.top - rect.height / 2;
      const nx = cx * (1 - m) + startTransform.x * m;
      const ny = cy * (1 - m) + startTransform.y * m;

      // Clamp
      const imgW = imgSize ? imgSize.w * scaleNow : 0;
      const imgH = imgSize ? imgSize.h * scaleNow : 0;
      const maxX = Math.max(0, (imgW - rect.width) / 2);
      const maxY = Math.max(0, (imgH - rect.height) / 2);
      const clampedX = Math.max(-maxX, Math.min(maxX, nx));
      const clampedY = Math.max(-maxY, Math.min(maxY, ny));

      transformRef.current = { x: clampedX, y: clampedY, scale: scaleNow };
      img.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0) scale(${scaleNow})`;
      onZoomChangeRef.current?.(scaleNow);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

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
