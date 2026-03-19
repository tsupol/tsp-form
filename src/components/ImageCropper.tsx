import { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef, Ref } from 'react';
import clsx from 'clsx';
import '../styles/image-cropper.css';

export interface ImageCropperRef {
  /** Current zoom level */
  zoom: number;
  /** Minimum zoom (auto-computed so image covers viewport) */
  minZoom: number;
  /** Maximum zoom */
  maxZoom: number;
  /** Set zoom level (clamped to min/max, re-centers) */
  setZoom: (zoom: number) => void;
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
  /** Called whenever zoom changes (from gestures or setZoom) */
  onZoomChange?: (zoom: number) => void;
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
    onZoomChange,
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
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [minZoom, setMinZoom] = useState(minZoomProp ?? 1);

  // Gesture tracking ref
  const gestureRef = useRef<{
    type: 'mouse' | 'touch';
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
    startDist?: number;
    startZoom?: number;
    startMidX?: number;
    startMidY?: number;
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

  // Clamp position so image always covers viewport
  const clampPos = useCallback((x: number, y: number, z: number, nw: number, nh: number) => {
    const scaledW = nw * z;
    const scaledH = nh * z;
    return {
      x: Math.min(0, Math.max(viewportWidth - scaledW, x)),
      y: Math.min(0, Math.max(viewportHeight - scaledH, y)),
    };
  }, [viewportWidth, viewportHeight]);

  // Center image at a given zoom level
  const centerImage = useCallback((nw: number, nh: number, z: number) => {
    setPos({
      x: (viewportWidth - nw * z) / 2,
      y: (viewportHeight - nh * z) / 2,
    });
  }, [viewportWidth, viewportHeight]);

  // Compute minZoom on image load
  const handleImageLoad = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNaturalW(nw);
    setNaturalH(nh);

    const mz = minZoomProp ?? Math.max(viewportWidth / nw, viewportHeight / nh);
    setMinZoom(mz);
    setZoom(mz);
    onZoomChange?.(mz);
    centerImage(nw, nh, mz);
  }, [viewportWidth, viewportHeight, minZoomProp, centerImage, onZoomChange]);

  // Re-center when viewport dimensions change (e.g. aspectRatio prop changes)
  useEffect(() => {
    if (!naturalW || !naturalH) return;
    const mz = minZoomProp ?? Math.max(viewportWidth / naturalW, viewportHeight / naturalH);
    setMinZoom(mz);
    setZoom(mz);
    onZoomChange?.(mz);
    centerImage(naturalW, naturalH, mz);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewportWidth, viewportHeight]);

  // Ref for latest state (avoids stale closures in event listeners)
  const stateRef = useRef({ pos, zoom, minZoom, maxZoom, naturalW, naturalH });
  stateRef.current = { pos, zoom, minZoom, maxZoom, naturalW, naturalH };

  const onZoomChangeRef = useRef(onZoomChange);
  onZoomChangeRef.current = onZoomChange;

  // Imperative handle for consumer
  useImperativeHandle(ref, () => ({
    get zoom() { return stateRef.current.zoom; },
    get minZoom() { return stateRef.current.minZoom; },
    get maxZoom() { return stateRef.current.maxZoom; },
    setZoom: (newZoom: number) => {
      const s = stateRef.current;
      const clamped = Math.min(s.maxZoom, Math.max(s.minZoom, newZoom));
      setZoom(clamped);
      setPos(prev => clampPos(prev.x, prev.y, clamped, s.naturalW, s.naturalH));
      onZoomChangeRef.current?.(clamped);
    },
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

      const sourceX = -s.pos.x / s.zoom;
      const sourceY = -s.pos.y / s.zoom;
      const sourceW = viewportWidth / s.zoom;
      const sourceH = viewportHeight / s.zoom;

      ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, outW, outH);

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
  }), [clampPos, viewportWidth, viewportHeight, aspectRatio, outputWidth, outputType, outputQuality]);

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

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      gestureRef.current = {
        type: 'mouse', startX: e.clientX, startY: e.clientY,
        startPosX: s.pos.x, startPosY: s.pos.y,
      };
    };

    const onMouseMove = (e: MouseEvent) => {
      const g = gestureRef.current;
      if (!g || g.type !== 'mouse') return;
      const s = stateRef.current;
      setPos(clampPos(g.startPosX + e.clientX - g.startX, g.startPosY + e.clientY - g.startY, s.zoom, s.naturalW, s.naturalH));
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
          startPosX: s.pos.x, startPosY: s.pos.y,
        };
      } else if (e.touches.length >= 2) {
        const t1 = e.touches[0], t2 = e.touches[1];
        const mid = getTouchMid(t1, t2);
        gestureRef.current = {
          type: 'touch', startX: mid.x, startY: mid.y,
          startPosX: s.pos.x, startPosY: s.pos.y,
          startDist: getTouchDist(t1, t2), startZoom: s.zoom,
          startMidX: mid.x, startMidY: mid.y,
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
        const newZoom = Math.min(s.maxZoom, Math.max(s.minZoom, g.startZoom * (dist / g.startDist)));

        const vpRect = vp.getBoundingClientRect();
        const midVpX = g.startMidX! - vpRect.left;
        const midVpY = g.startMidY! - vpRect.top;
        const imgX = (midVpX - g.startPosX) / g.startZoom;
        const imgY = (midVpY - g.startPosY) / g.startZoom;
        const newX = midVpX - imgX * newZoom + (mid.x - g.startX);
        const newY = midVpY - imgY * newZoom + (mid.y - g.startY);

        setZoom(newZoom);
        onZoomChangeRef.current?.(newZoom);
        setPos(clampPos(newX, newY, newZoom, s.naturalW, s.naturalH));
      } else if (e.touches.length === 1) {
        const t = e.touches[0];
        setPos(clampPos(g.startPosX + t.clientX - g.startX, g.startPosY + t.clientY - g.startY, s.zoom, s.naturalW, s.naturalH));
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
          startPosX: s.pos.x, startPosY: s.pos.y,
        };
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!wheelZoom) return;
      e.preventDefault();
      const s = stateRef.current;
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newZoom = Math.min(s.maxZoom, Math.max(s.minZoom, s.zoom * factor));
      if (newZoom === s.zoom) return;

      const vpRect = vp.getBoundingClientRect();
      const cx = e.clientX - vpRect.left;
      const cy = e.clientY - vpRect.top;
      const imgX = (cx - s.pos.x) / s.zoom;
      const imgY = (cy - s.pos.y) / s.zoom;

      setZoom(newZoom);
      onZoomChangeRef.current?.(newZoom);
      setPos(clampPos(cx - imgX * newZoom, cy - imgY * newZoom, newZoom, s.naturalW, s.naturalH));
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
  }, [clampPos, wheelZoom]);

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
            style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})` }}
            alt=""
          />
        )}
        <div className="image-cropper-overlay" />
      </div>
    </div>
  );
});
