import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef, Ref } from 'react';
import clsx from 'clsx';
import '../styles/image-cropper.css';

export interface ImageCropperRef {
  /** Current zoom level */
  zoom: number;
  /** Minimum zoom (auto-computed so image covers viewport, accounting for current rotation) */
  minZoom: number;
  /** Maximum zoom */
  maxZoom: number;
  /** Set zoom level (clamped to min/max, re-centers) */
  setZoom: (zoom: number) => void;
  /** Current rotation in degrees */
  rotation: number;
  /** Set rotation in degrees (clamped to min/max). Auto-bumps zoom if needed to keep coverage. */
  setRotation: (deg: number) => void;
  /** Render the visible crop area to a Blob + File, returned via the callback */
  crop: (callback: (blob: Blob, file: File) => void) => void;
}

export interface ImageCropperProps {
  src: string | File | Blob;
  aspectRatio?: number;
  minZoom?: number;
  maxZoom?: number;
  outputType?: string;
  outputQuality?: number;
  outputWidth?: number;
  className?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  wheelZoom?: boolean;
  /**
   * Exponent applied to zoom steps so they feel uniform across the zoom range.
   * Wheel and pinch deltas advance the *curve position* (0..1) by a fixed amount, then map back to zoom.
   * 1 = linear; >1 = finer control at low zoom, faster at high zoom. Default 2.2.
   */
  zoomCurve?: number;
  /** Enable rotation: 2-finger touch rotates, Ctrl+wheel rotates, imperative setRotation works. Default false. */
  rotation?: boolean;
  /** Min/max rotation in degrees. Defaults -180 to 180. */
  minRotation?: number;
  maxRotation?: number;
  /** Called whenever zoom changes (from gestures or setZoom). Receives current zoom, plus the active min/max bounds. */
  onZoomChange?: (zoom: number, minZoom: number, maxZoom: number) => void;
  /** Called whenever rotation changes (degrees). */
  onRotationChange?: (deg: number) => void;
}

// Smallest zoom that keeps a rotated image covering the viewport. Uses the
// rotated image's axis-aligned bounding box (inscribed-rectangle math).
function computeMinZoom(nw: number, nh: number, vpW: number, vpH: number, rotDeg: number, propMin?: number): number {
  if (propMin != null) return propMin;
  const r = (rotDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(r));
  const sin = Math.abs(Math.sin(r));
  // For the rotated image (size nw x nh) to fully cover an axis-aligned viewport (vpW x vpH),
  // we need scale s such that the *inscribed* axis-aligned rect inside the rotated image is >= viewport.
  // Equivalently the viewport rotated into image space must fit inside the image:
  //   vpW * cos + vpH * sin <= nw * s
  //   vpW * sin + vpH * cos <= nh * s
  const sx = (vpW * cos + vpH * sin) / nw;
  const sy = (vpW * sin + vpH * cos) / nh;
  return Math.max(sx, sy);
}

export const ImageCropper = forwardRef(function ImageCropper(
  {
    src,
    aspectRatio = 1,
    minZoom: minZoomProp,
    maxZoom = 4,
    outputType = 'image/jpeg',
    outputQuality = 0.9,
    outputWidth,
    className,
    viewportWidth = 300,
    viewportHeight: viewportHeightProp,
    wheelZoom = true,
    zoomCurve = 2.2,
    rotation: rotationEnabled = false,
    minRotation = -180,
    maxRotation = 180,
    onZoomChange,
    onRotationChange,
  }: ImageCropperProps,
  ref: Ref<ImageCropperRef>,
) {
  const viewportHeight = viewportHeightProp ?? Math.round(viewportWidth / aspectRatio);

  const imgRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState<string>('');
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [zoom, setZoom] = useState(1);
  // Center of image (in viewport coords). Using center simplifies rotation math.
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [rotationDeg, setRotationDeg] = useState(0);
  const [minZoom, setMinZoom] = useState(minZoomProp ?? 1);

  // Gesture tracking ref
  const gestureRef = useRef<{
    type: 'mouse' | 'touch';
    startX: number;
    startY: number;
    startCenterX: number;
    startCenterY: number;
    startDist?: number;
    startZoom?: number;
    startAngle?: number;
    startRotation?: number;
  } | null>(null);

  // Resolve src to object URL if File/Blob
  useEffect(() => {
    if (typeof src === 'string') {
      setImgSrc(src);
      return;
    }
    const url = URL.createObjectURL(src);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [src]);

  // Clamp center so the rotated+scaled image always covers viewport.
  // The image (rotated by θ, scaled by z) has an inscribed axis-aligned coverage region.
  // The viewport rotated into image space is (vpW*|cos|+vpH*|sin|) × (vpW*|sin|+vpH*|cos|).
  // Center constraints: distance from image center to viewport edge <= (image extent in that axis) - (viewport extent / 2) along rotated axes.
  // Simpler: compute the AABB of the rotated image and require image-AABB to contain the viewport-AABB centered offset.
  // We allow center to move such that the (rotated, scaled) image AABB still contains the viewport.
  const clampCenter = useCallback((cx: number, cy: number, z: number, rotDeg: number, nw: number, nh: number) => {
    const r = (rotDeg * Math.PI) / 180;
    const cos = Math.abs(Math.cos(r));
    const sin = Math.abs(Math.sin(r));
    // Axis-aligned bounding box of the rotated, scaled image:
    const bboxW = (nw * cos + nh * sin) * z;
    const bboxH = (nw * sin + nh * cos) * z;
    // Center must keep the bbox covering the viewport (0..vpW, 0..vpH):
    //   cx - bboxW/2 <= 0  AND  cx + bboxW/2 >= vpW
    //   → vpW - bboxW/2 <= cx <= bboxW/2
    const minCx = viewportWidth - bboxW / 2;
    const maxCx = bboxW / 2;
    const minCy = viewportHeight - bboxH / 2;
    const maxCy = bboxH / 2;
    return {
      x: minCx > maxCx ? viewportWidth / 2 : Math.min(maxCx, Math.max(minCx, cx)),
      y: minCy > maxCy ? viewportHeight / 2 : Math.min(maxCy, Math.max(minCy, cy)),
    };
  }, [viewportWidth, viewportHeight]);

  const centerImage = useCallback(() => {
    setCenter({ x: viewportWidth / 2, y: viewportHeight / 2 });
  }, [viewportWidth, viewportHeight]);

  // Compute minZoom on image load
  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNaturalW(nw);
    setNaturalH(nh);

    const mz = computeMinZoom(nw, nh, viewportWidth, viewportHeight, 0, minZoomProp);
    setMinZoom(mz);
    setZoom(mz);
    setRotationDeg(0);
    onZoomChange?.(mz, mz, maxZoom);
    onRotationChange?.(0);
    setCenter({ x: viewportWidth / 2, y: viewportHeight / 2 });
  }, [viewportWidth, viewportHeight, minZoomProp, maxZoom, onZoomChange, onRotationChange]);

  // Re-center when viewport dimensions change
  useEffect(() => {
    if (!naturalW || !naturalH) return;
    const mz = computeMinZoom(naturalW, naturalH, viewportWidth, viewportHeight, rotationDeg, minZoomProp);
    setMinZoom(mz);
    setZoom((z) => Math.max(z, mz));
    onZoomChange?.(Math.max(zoom, mz), mz, maxZoom);
    centerImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportWidth, viewportHeight]);

  // Ref for latest state (avoids stale closures in event listeners)
  const stateRef = useRef({ center, zoom, minZoom, maxZoom, naturalW, naturalH, rotationDeg });
  stateRef.current = { center, zoom, minZoom, maxZoom, naturalW, naturalH, rotationDeg };

  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;
  const onRotationChangeRef = useRef(onRotationChange);
  onRotationChangeRef.current = onRotationChange;

  // Internal helper: change zoom while anchoring the viewport-center image point.
  const applyZoom = useCallback((newZoom: number) => {
    const s = stateRef.current;
    const clamped = Math.min(s.maxZoom, Math.max(s.minZoom, newZoom));
    if (clamped === s.zoom) return;
    // Keep image-center pinned to whatever it currently maps to in the viewport,
    // but allow clampCenter to nudge. Simplest: scale center offset from viewport-center proportionally.
    const vpCx = viewportWidth / 2;
    const vpCy = viewportHeight / 2;
    const ratio = clamped / s.zoom;
    const newCenter = {
      x: vpCx + (s.center.x - vpCx) * ratio,
      y: vpCy + (s.center.y - vpCy) * ratio,
    };
    setZoom(clamped);
    setCenter(clampCenter(newCenter.x, newCenter.y, clamped, s.rotationDeg, s.naturalW, s.naturalH));
    onZoomChangeRef.current?.(clamped, s.minZoom, s.maxZoom);
  }, [clampCenter, viewportWidth, viewportHeight]);

  // Internal helper: change rotation. Recomputes minZoom and re-maps current zoom to preserve
  // its position on the [min, max] curve — so the consumer's slider thumb stays put while
  // rotation shifts the absolute zoom needed for coverage.
  const applyRotation = useCallback((deg: number) => {
    const s = stateRef.current;
    const clamped = Math.min(maxRotation, Math.max(minRotation, deg));
    if (clamped === s.rotationDeg) return;
    if (!s.naturalW || !s.naturalH) {
      setRotationDeg(clamped);
      onRotationChangeRef.current?.(clamped);
      return;
    }
    const newMin = computeMinZoom(s.naturalW, s.naturalH, viewportWidth, viewportHeight, clamped, minZoomProp);
    // Preserve curve position: t = ((zoom - oldMin) / (oldMax - oldMin))^(1/curve)
    // newZoom = newMin + (newMax - newMin) * t^curve
    const oldRange = Math.max(s.maxZoom - s.minZoom, 1e-6);
    const t = Math.pow(Math.min(1, Math.max(0, (s.zoom - s.minZoom) / oldRange)), 1 / zoomCurve);
    const newRange = Math.max(s.maxZoom - newMin, 1e-6);
    const newZoom = Math.min(s.maxZoom, Math.max(newMin, newMin + newRange * Math.pow(t, zoomCurve)));

    setRotationDeg(clamped);
    setMinZoom(newMin);
    if (newZoom !== s.zoom) {
      setZoom(newZoom);
      onZoomChangeRef.current?.(newZoom, newMin, s.maxZoom);
    } else if (newMin !== s.minZoom) {
      onZoomChangeRef.current?.(s.zoom, newMin, s.maxZoom);
    }
    setCenter((c) => clampCenter(c.x, c.y, newZoom, clamped, s.naturalW, s.naturalH));
    onRotationChangeRef.current?.(clamped);
  }, [clampCenter, viewportWidth, viewportHeight, minZoomProp, minRotation, maxRotation, zoomCurve]);

  // Imperative handle for consumer
  useImperativeHandle(ref, () => ({
    get zoom() { return stateRef.current.zoom; },
    get minZoom() { return stateRef.current.minZoom; },
    get maxZoom() { return stateRef.current.maxZoom; },
    get rotation() { return stateRef.current.rotationDeg; },
    setZoom: applyZoom,
    setRotation: applyRotation,
    crop: (callback) => {
      const s = stateRef.current;
      if (!s.naturalW || !s.naturalH) return;
      const img = imgRef.current;
      if (!img) return;

      const canvas = document.createElement('canvas');
      const outW = outputWidth ?? viewportWidth;
      const outH = outputWidth ? Math.round(outputWidth / aspectRatio) : viewportHeight;
      canvas.width = outW;
      canvas.height = outH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // The viewport shows: starting at (0,0), the image transformed by
      //   translate(center) rotate(θ) scale(z) translate(-nw/2, -nh/2)
      // To draw the *visible* viewport region into the output canvas, we render the
      // image at output scale with the inverse mapping.
      const scaleOut = outW / viewportWidth;
      const r = (s.rotationDeg * Math.PI) / 180;

      ctx.save();
      // Move origin to where the image-center maps to in output space:
      ctx.translate(s.center.x * scaleOut, s.center.y * scaleOut);
      ctx.rotate(r);
      ctx.scale(s.zoom * scaleOut, s.zoom * scaleOut);
      // Draw image centered at origin:
      ctx.drawImage(img, -s.naturalW / 2, -s.naturalH / 2);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const ext = outputType.split('/')[1] || 'jpg';
            const file = new File([blob], `cropped.${ext}`, { type: outputType });
            callback(blob, file);
          }
        },
        outputType,
        outputQuality,
      );
    },
  }), [applyZoom, applyRotation, viewportWidth, viewportHeight, aspectRatio, outputWidth, outputType, outputQuality]);

  // Gesture event listeners
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    function getTouchDist(t1: Touch, t2: Touch) {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function getTouchMid(t1: Touch, t2: Touch) {
      return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
    }

    function getTouchAngle(t1: Touch, t2: Touch) {
      return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
    }

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      gestureRef.current = {
        type: 'mouse', startX: e.clientX, startY: e.clientY,
        startCenterX: s.center.x, startCenterY: s.center.y,
      };
    };

    const onMouseMove = (e: MouseEvent) => {
      const g = gestureRef.current;
      if (!g || g.type !== 'mouse') return;
      const s = stateRef.current;
      setCenter(clampCenter(
        g.startCenterX + e.clientX - g.startX,
        g.startCenterY + e.clientY - g.startY,
        s.zoom, s.rotationDeg, s.naturalW, s.naturalH,
      ));
    };

    const onMouseUp = () => {
      if (gestureRef.current?.type === 'mouse') gestureRef.current = null;
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      if (e.touches.length === 1) {
        const t = e.touches[0];
        gestureRef.current = {
          type: 'touch', startX: t.clientX, startY: t.clientY,
          startCenterX: s.center.x, startCenterY: s.center.y,
        };
      } else if (e.touches.length >= 2) {
        const t1 = e.touches[0], t2 = e.touches[1];
        const mid = getTouchMid(t1, t2);
        gestureRef.current = {
          type: 'touch', startX: mid.x, startY: mid.y,
          startCenterX: s.center.x, startCenterY: s.center.y,
          startDist: getTouchDist(t1, t2), startZoom: s.zoom,
          startAngle: getTouchAngle(t1, t2), startRotation: s.rotationDeg,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const g = gestureRef.current;
      if (!g || g.type !== 'touch') return;
      const s = stateRef.current;

      if (e.touches.length >= 2 && g.startDist && g.startZoom != null) {
        const t1 = e.touches[0], t2 = e.touches[1];
        const dist = getTouchDist(t1, t2);
        const mid = getTouchMid(t1, t2);

        // Rotation (if enabled): delta between touch-pair angle now vs at start.
        let newRotation = s.rotationDeg;
        let newMin = s.minZoom;
        if (rotationEnabled && g.startAngle != null && g.startRotation != null) {
          const angle = getTouchAngle(t1, t2);
          let delta = angle - g.startAngle;
          // normalize delta to [-180, 180] to avoid huge jumps when crossing ±180:
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;
          newRotation = Math.min(maxRotation, Math.max(minRotation, g.startRotation + delta));
          newMin = computeMinZoom(s.naturalW, s.naturalH, viewportWidth, viewportHeight, newRotation, minZoomProp);
        }

        const scaleFactor = dist / g.startDist;
        // Apply pinch on top of curve-preserved zoom: first re-map current zoom to new range,
        // then apply scaleFactor. So rotation alone keeps slider position, pinch still scales physically.
        const oldRange = Math.max(s.maxZoom - s.minZoom, 1e-6);
        const tPos = Math.pow(Math.min(1, Math.max(0, (g.startZoom - s.minZoom) / oldRange)), 1 / zoomCurve);
        const newRange = Math.max(s.maxZoom - newMin, 1e-6);
        const remappedStart = newMin + newRange * Math.pow(tPos, zoomCurve);
        const newZoom = Math.min(s.maxZoom, Math.max(newMin, remappedStart * scaleFactor));

        // Translate center by midpoint delta (pan during pinch):
        const newCenter = clampCenter(
          g.startCenterX + (mid.x - g.startX),
          g.startCenterY + (mid.y - g.startY),
          newZoom, newRotation, s.naturalW, s.naturalH,
        );

        setZoom(newZoom);
        if (rotationEnabled && newRotation !== s.rotationDeg) {
          setRotationDeg(newRotation);
          setMinZoom(newMin);
          onRotationChangeRef.current?.(newRotation);
        }
        setCenter(newCenter);
        onZoomChangeRef.current?.(newZoom, newMin, s.maxZoom);
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        setCenter(clampCenter(
          g.startCenterX + t.clientX - g.startX,
          g.startCenterY + t.clientY - g.startY,
          s.zoom, s.rotationDeg, s.naturalW, s.naturalH,
        ));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        gestureRef.current = null;
      } else if (e.touches.length === 1) {
        const s = stateRef.current;
        const t = e.touches[0];
        gestureRef.current = {
          type: 'touch', startX: t.clientX, startY: t.clientY,
          startCenterX: s.center.x, startCenterY: s.center.y,
        };
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Ctrl+wheel → rotation (when enabled). Otherwise zoom.
      if (rotationEnabled && e.ctrlKey) {
        e.preventDefault();
        const s = stateRef.current;
        // Scale delta so trackpads (small deltaY per event) feel smooth and mice (deltaY ≈100/notch) get ~2° per notch.
        const step = -e.deltaY * 0.02;
        // Clamp absurd deltas (some browsers report huge values when modifier is held).
        const clampedStep = Math.max(-5, Math.min(5, step));
        applyRotation(s.rotationDeg + clampedStep);
        return;
      }
      if (!wheelZoom) return;
      e.preventDefault();
      const s = stateRef.current;
      const range = Math.max(s.maxZoom - s.minZoom, 1e-6);
      const t = Math.pow(Math.min(1, Math.max(0, (s.zoom - s.minZoom) / range)), 1 / zoomCurve);
      const step = e.deltaY < 0 ? 0.04 : -0.04;
      const newT = Math.min(1, Math.max(0, t + step));
      const newZoom = s.minZoom + range * Math.pow(newT, zoomCurve);
      if (newZoom === s.zoom) return;
      applyZoom(newZoom);
    };

    vp.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    vp.addEventListener('touchstart', onTouchStart, { passive: false });
    vp.addEventListener('touchmove', onTouchMove, { passive: false });
    vp.addEventListener('touchend', onTouchEnd);
    vp.addEventListener('touchcancel', onTouchEnd);
    vp.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      vp.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      vp.removeEventListener('touchstart', onTouchStart);
      vp.removeEventListener('touchmove', onTouchMove);
      vp.removeEventListener('touchend', onTouchEnd);
      vp.removeEventListener('touchcancel', onTouchEnd);
      vp.removeEventListener('wheel', onWheel);
    };
  }, [clampCenter, wheelZoom, zoomCurve, rotationEnabled, minRotation, maxRotation, minZoomProp, viewportWidth, viewportHeight, applyZoom, applyRotation]);

  // Image is positioned so its *center* sits at `center`, then rotated & scaled around that center.
  return (
    <div className={clsx('image-cropper', className)}>
      <div
        ref={viewportRef}
        className="image-cropper-viewport"
        style={{ width: viewportWidth, height: viewportHeight }}
      >
        {imgSrc && (
          <img
            ref={imgRef}
            src={imgSrc}
            onLoad={handleImageLoad}
            style={naturalW > 0 ? {
              position: 'absolute',
              left: center.x,
              top: center.y,
              width: naturalW,
              height: naturalH,
              transform: `translate(-50%, -50%) rotate(${rotationDeg}deg) scale(${zoom})`,
              transformOrigin: 'center center',
              willChange: 'transform',
            } : { visibility: 'hidden' }}
            alt=""
          />
        )}
        <div className="image-cropper-overlay" />
      </div>
    </div>
  );
});
