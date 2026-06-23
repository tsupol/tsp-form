import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import clsx from 'clsx';
import '../styles/image-uploader.css';

export type CropMode = 'contain' | 'cover' | 'fill';
export type CropPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ResizeOptions {
  // Max bounds (scales down proportionally with contain, crops with cover)
  maxWidth?: number;
  maxHeight?: number;
  // Exact dimensions (overrides maxWidth/maxHeight if set)
  width?: number;
  height?: number;
  // Aspect ratio constraint (e.g., 16/9, 1, 4/3) - applied before max bounds
  aspectRatio?: number;
  // How to handle aspect ratio mismatch
  mode?: CropMode;
  // Where to position crop (for cover mode)
  cropPosition?: CropPosition;
  // Output quality 0-1 for JPEG/WebP
  quality?: number;
  // Output format
  format?: 'jpeg' | 'png' | 'webp' | 'original';
}

export interface ResizedVariant {
  file: File;
  preview: string;
  width: number;
  height: number;
  size: number;
}

export interface UploadedImage {
  id: string;
  originalFile: File;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  // Populated in single-size mode (no `sizes` prop)
  file?: File;
  preview?: string;
  width?: number;
  height?: number;
  size?: number;
  // Populated in multi-size mode (`sizes` prop set)
  variants?: Record<string, ResizedVariant>;
}

export interface ImageUploaderProps {
  onUpload?: (images: UploadedImage[]) => void;
  resizeOptions?: ResizeOptions;
  // Multi-size mode: emit one variant per entry. Per-variant fields override `resizeOptions`.
  // When set, top-level `file`/`preview`/`width`/`height`/`size` on UploadedImage are undefined
  // and consumers read from `variants[key]` instead.
  sizes?: Record<string, ResizeOptions>;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  placeholder?: React.ReactNode;
}

const DEFAULT_RESIZE_OPTIONS: ResizeOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'original',
  mode: 'contain',
  cropPosition: 'center',
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function getCropOffset(
  position: CropPosition,
  sourceWidth: number,
  sourceHeight: number,
  cropWidth: number,
  cropHeight: number
): { sx: number; sy: number } {
  const maxX = sourceWidth - cropWidth;
  const maxY = sourceHeight - cropHeight;

  switch (position) {
    case 'top-left':
      return { sx: 0, sy: 0 };
    case 'top':
      return { sx: maxX / 2, sy: 0 };
    case 'top-right':
      return { sx: maxX, sy: 0 };
    case 'left':
      return { sx: 0, sy: maxY / 2 };
    case 'center':
      return { sx: maxX / 2, sy: maxY / 2 };
    case 'right':
      return { sx: maxX, sy: maxY / 2 };
    case 'bottom-left':
      return { sx: 0, sy: maxY };
    case 'bottom':
      return { sx: maxX / 2, sy: maxY };
    case 'bottom-right':
      return { sx: maxX, sy: maxY };
    default:
      return { sx: maxX / 2, sy: maxY / 2 };
  }
}

// Encode a canvas honestly: produce the requested format and report the MIME +
// extension that the bytes ACTUALLY are — never the requested format blindly.
//
// Safari < 17.4 silently ignores `toBlob(..., 'image/webp')` and hands back a
// PNG blob. The old code labelled that PNG as `image/webp` and named the file
// `.webp` — a file whose bytes, name, and DB mime_type all disagreed. Here we
// inspect `blob.type` and, for webp/original requests, fall back to JPEG when
// webp isn't produced, returning the real type either way. PNG is requested
// explicitly (e.g. a signature pad) and always succeeds, so no fallback there.
function encodeCanvasHonest(
  canvas: HTMLCanvasElement,
  format: NonNullable<ResizeOptions['format']>,
  sourceMimeType: string,
  quality: number,
): Promise<{ blob: Blob; mime: string; ext: string }> {
  const toBlob = (type: string) =>
    new Promise<Blob | null>((res) => canvas.toBlob(res, type, quality));

  return (async () => {
    // PNG: lossless, universally supported — request and trust it.
    if (format === 'png') {
      const png = await toBlob('image/png');
      if (!png) throw new Error('canvas encode failed: no blob');
      return { blob: png, mime: 'image/png', ext: 'png' };
    }

    // JPEG: also universally supported.
    if (format === 'jpeg') {
      const jpeg = await toBlob('image/jpeg');
      if (!jpeg) throw new Error('canvas encode failed: no blob');
      return { blob: jpeg, mime: 'image/jpeg', ext: 'jpg' };
    }

    // 'original': keep the source type when it's one we can re-encode;
    // otherwise treat as webp (the modern default) with the webp→jpeg fallback.
    if (format === 'original') {
      if (sourceMimeType === 'image/png') {
        const png = await toBlob('image/png');
        if (png && png.type === 'image/png') return { blob: png, mime: 'image/png', ext: 'png' };
      }
      if (sourceMimeType === 'image/jpeg') {
        const jpeg = await toBlob('image/jpeg');
        if (jpeg && jpeg.type === 'image/jpeg') return { blob: jpeg, mime: 'image/jpeg', ext: 'jpg' };
      }
      // fall through to webp→jpeg for everything else
    }

    // webp (or original-fallthrough): try webp, then JPEG. Report what came out.
    const webp = await toBlob('image/webp');
    if (webp && webp.type === 'image/webp') return { blob: webp, mime: 'image/webp', ext: 'webp' };
    const jpeg = await toBlob('image/jpeg');
    if (!jpeg) throw new Error('canvas encode failed: browser returned no blob');
    if (jpeg.type !== 'image/jpeg') {
      throw new Error(`canvas encode failed: browser cannot produce webp or jpeg (got ${jpeg.type || 'unknown'})`);
    }
    return { blob: jpeg, mime: 'image/jpeg', ext: 'jpg' };
  })();
}

/** Swap a filename's extension to match the encoded format. */
function renameForExt(name: string, ext: string): string {
  return name.replace(/\.[^.]+$/, '') + '.' + ext;
}

function resizeLoadedImage(
  img: HTMLImageElement,
  sourceMimeType: string,
  options: ResizeOptions
): Promise<{ blob: Blob; mime: string; ext: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = Infinity,
      maxHeight = Infinity,
      width: exactWidth,
      height: exactHeight,
      aspectRatio,
      mode = 'contain',
      cropPosition = 'center',
      quality = 0.85,
      format = 'original'
    } = options;

    const srcWidth = img.width;
    const srcHeight = img.height;
    const srcRatio = srcWidth / srcHeight;

    let targetWidth: number;
    let targetHeight: number;
    let sx = 0, sy = 0, sw = srcWidth, sh = srcHeight;

    // Step 1: Determine target dimensions
    if (exactWidth && exactHeight) {
      targetWidth = exactWidth;
      targetHeight = exactHeight;
    } else if (exactWidth) {
      targetWidth = exactWidth;
      targetHeight = aspectRatio ? exactWidth / aspectRatio : exactWidth / srcRatio;
    } else if (exactHeight) {
      targetHeight = exactHeight;
      targetWidth = aspectRatio ? exactHeight * aspectRatio : exactHeight * srcRatio;
    } else if (aspectRatio) {
      if (srcRatio > aspectRatio) {
        targetHeight = Math.min(srcHeight, maxHeight);
        targetWidth = targetHeight * aspectRatio;
      } else {
        targetWidth = Math.min(srcWidth, maxWidth);
        targetHeight = targetWidth / aspectRatio;
      }
      if (targetWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = targetWidth / aspectRatio;
      }
      if (targetHeight > maxHeight) {
        targetHeight = maxHeight;
        targetWidth = targetHeight * aspectRatio;
      }
    } else {
      targetWidth = srcWidth;
      targetHeight = srcHeight;
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }
    }

    // No-upscale: clamp target to source dimensions, preserving aspect ratio of the
    // resolved target. Exact specs become ceilings — if the source is smaller, emit
    // at source size instead of upscaling.
    if (targetWidth > srcWidth || targetHeight > srcHeight) {
      const downscale = Math.min(srcWidth / targetWidth, srcHeight / targetHeight, 1);
      targetWidth = targetWidth * downscale;
      targetHeight = targetHeight * downscale;
    }

    targetWidth = Math.round(targetWidth);
    targetHeight = Math.round(targetHeight);

    const targetRatio = targetWidth / targetHeight;

    // Step 2: Handle crop mode
    if (mode === 'cover') {
      if (srcRatio > targetRatio) {
        sh = srcHeight;
        sw = srcHeight * targetRatio;
        const offset = getCropOffset(cropPosition, srcWidth, srcHeight, sw, sh);
        sx = offset.sx;
        sy = 0;
      } else {
        sw = srcWidth;
        sh = srcWidth / targetRatio;
        const offset = getCropOffset(cropPosition, srcWidth, srcHeight, sw, sh);
        sx = 0;
        sy = offset.sy;
      }
    } else if (mode === 'contain') {
      if (!exactWidth && !exactHeight && !aspectRatio) {
        // Already handled above
      } else if (srcRatio > targetRatio) {
        targetHeight = Math.round(targetWidth / srcRatio);
      } else {
        targetWidth = Math.round(targetHeight * srcRatio);
      }
    }
    // mode === 'fill': stretch to exact dimensions (no adjustment needed)

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

    encodeCanvasHonest(canvas, format, sourceMimeType, quality)
      .then(({ blob, mime, ext }) =>
        resolve({ blob, mime, ext, width: targetWidth, height: targetHeight }))
      .catch(reject);
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };
    img.src = url;
  });
}

/**
 * Resize a source image into one or more variants — the same processor the
 * `ImageUploader` UI uses, decoupled so non-drop-zone flows (camera capture,
 * chat attachments, post-crop output) can share it instead of hand-rolling a
 * canvas resize.
 *
 * `src` may be a raw `File` (decoded internally) or an already-decoded
 * `HTMLImageElement` (e.g. the output of an interactive crop/rotate — saves a
 * decode pass). `sizes` maps a variant label to its `ResizeOptions`; pass a
 * single entry for a single-size type.
 *
 * Output files are named `${baseName}-${label}.${ext}` where `ext` reflects
 * the format actually produced (webp, jpg, or png) — honest about the bytes,
 * never a hardcoded guess. `baseName` defaults to the source file's name (sans
 * extension) or `'image'`.
 *
 * For a `File` source, `format: 'original'` preserves PNG/JPEG sources and
 * encodes everything else as webp (JPEG fallback). For an `HTMLImageElement`
 * source the original type is unknown, so `'original'` behaves as webp.
 */
export async function resizeToVariants(
  src: File | HTMLImageElement,
  sizes: Record<string, ResizeOptions>,
  baseName?: string,
): Promise<Record<string, ResizedVariant>> {
  const isFile = src instanceof File;
  const img = isFile ? await loadImageFromFile(src) : src;
  const sourceMime = isFile ? src.type : '';
  const name =
    baseName ??
    (isFile ? src.name.replace(/\.[^.]+$/, '') : null) ??
    'image';

  const out: Record<string, ResizedVariant> = {};
  for (const [label, opts] of Object.entries(sizes)) {
    const { blob, ext, width, height } = await resizeLoadedImage(img, sourceMime, opts);
    const file = new File([blob], `${name}-${label}.${ext}`, { type: blob.type });
    out[label] = {
      file,
      preview: URL.createObjectURL(blob),
      width,
      height,
      size: blob.size,
    };
  }
  return out;
}

export function ImageUploader({
  onUpload,
  resizeOptions = DEFAULT_RESIZE_OPTIONS,
  sizes,
  multiple = false,
  accept = 'image/*',
  maxFiles = 10,
  disabled = false,
  className,
  placeholder,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, multiple ? maxFiles : 1);

    if (fileArray.length === 0) return;

    setIsProcessing(true);

    try {
      const results: UploadedImage[] = [];

      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) continue;

        const img = await loadImageFromFile(file);
        const originalWidth = img.width;
        const originalHeight = img.height;

        if (sizes) {
          const variants: Record<string, ResizedVariant> = {};
          for (const [key, perVariant] of Object.entries(sizes)) {
            const merged = { ...resizeOptions, ...perVariant };
            const { blob, ext, width, height } = await resizeLoadedImage(img, file.type, merged);
            const variantFile = new File([blob], renameForExt(file.name, ext), { type: blob.type });
            variants[key] = {
              file: variantFile,
              preview: URL.createObjectURL(blob),
              width,
              height,
              size: blob.size,
            };
          }
          results.push({
            id: generateId(),
            originalFile: file,
            originalWidth,
            originalHeight,
            originalSize: file.size,
            variants,
          });
        } else {
          const { blob, ext, width, height } = await resizeLoadedImage(img, file.type, resizeOptions);
          const resizedFile = new File([blob], renameForExt(file.name, ext), { type: blob.type });
          results.push({
            id: generateId(),
            file: resizedFile,
            originalFile: file,
            preview: URL.createObjectURL(blob),
            width,
            height,
            originalWidth,
            originalHeight,
            size: blob.size,
            originalSize: file.size,
          });
        }
      }

      onUpload?.(results);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onUpload, resizeOptions, sizes, multiple, maxFiles]);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (disabled || isProcessing) return;

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [disabled, isProcessing, processFiles]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [processFiles]);

  const handleClick = useCallback(() => {
    if (disabled || isProcessing) return;
    inputRef.current?.click();
  }, [disabled, isProcessing]);

  return (
    <div
      className={clsx(
        'image-uploader',
        isDragging && 'image-uploader-dragging',
        isProcessing && 'image-uploader-processing',
        disabled && 'image-uploader-disabled',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="image-uploader-input"
        disabled={disabled}
      />
      {isProcessing ? (
        <div className="image-uploader-content">
          <div className="image-uploader-spinner" />
          <span>Processing...</span>
        </div>
      ) : placeholder ? (
        placeholder
      ) : (
        <div className="image-uploader-content">
          <svg
            className="image-uploader-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {isDragging ? 'Drop image here' : 'Click or drag image'}
          </span>
          {multiple && <span className="image-uploader-hint">Up to {maxFiles} files</span>}
        </div>
      )}
    </div>
  );
}

// Revokes every blob URL on an UploadedImage (top-level `preview` and all `variants[*].preview`).
// Call this when removing an image from state or in an effect cleanup to avoid leaking blob URLs.
export function revokeUploadedImage(image: UploadedImage): void {
  if (image.preview) URL.revokeObjectURL(image.preview);
  if (image.variants) {
    for (const v of Object.values(image.variants)) {
      URL.revokeObjectURL(v.preview);
    }
  }
}

// Revokes blob URLs on a list of UploadedImages.
export function revokeUploadedImages(images: UploadedImage[]): void {
  for (const img of images) revokeUploadedImage(img);
}

// Preset resize options for common use cases
export const RESIZE_PRESETS = {
  thumbnail: { maxWidth: 150, maxHeight: 150, quality: 0.8 },
  small: { maxWidth: 320, maxHeight: 320, quality: 0.8 },
  medium: { maxWidth: 640, maxHeight: 640, quality: 0.85 },
  large: { maxWidth: 1280, maxHeight: 1280, quality: 0.85 },
  fullHD: { maxWidth: 1920, maxHeight: 1080, quality: 0.9 },
  '4k': { maxWidth: 3840, maxHeight: 2160, quality: 0.9 },
  original: { maxWidth: Infinity, maxHeight: Infinity, quality: 1 },
} as const;

// Common aspect ratios
export const ASPECT_RATIOS = {
  square: 1,
  '4:3': 4 / 3,
  '3:2': 3 / 2,
  '16:9': 16 / 9,
  '21:9': 21 / 9,
  '3:4': 3 / 4,
  '2:3': 2 / 3,
  '9:16': 9 / 16,
} as const;
