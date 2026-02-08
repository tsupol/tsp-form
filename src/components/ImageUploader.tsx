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

export interface UploadedImage {
  id: string;
  file: File;
  originalFile: File;
  preview: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  size: number;
  originalSize: number;
}

export interface ImageUploaderProps {
  onUpload?: (images: UploadedImage[]) => void;
  resizeOptions?: ResizeOptions;
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

async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

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
        // Exact dimensions specified
        targetWidth = exactWidth;
        targetHeight = exactHeight;
      } else if (exactWidth) {
        targetWidth = exactWidth;
        targetHeight = aspectRatio ? exactWidth / aspectRatio : exactWidth / srcRatio;
      } else if (exactHeight) {
        targetHeight = exactHeight;
        targetWidth = aspectRatio ? exactHeight * aspectRatio : exactHeight * srcRatio;
      } else if (aspectRatio) {
        // Apply aspect ratio constraint within max bounds
        if (srcRatio > aspectRatio) {
          // Source is wider, constrain by height
          targetHeight = Math.min(srcHeight, maxHeight);
          targetWidth = targetHeight * aspectRatio;
        } else {
          // Source is taller, constrain by width
          targetWidth = Math.min(srcWidth, maxWidth);
          targetHeight = targetWidth / aspectRatio;
        }
        // Apply max bounds
        if (targetWidth > maxWidth) {
          targetWidth = maxWidth;
          targetHeight = targetWidth / aspectRatio;
        }
        if (targetHeight > maxHeight) {
          targetHeight = maxHeight;
          targetWidth = targetHeight * aspectRatio;
        }
      } else {
        // No exact dimensions or aspect ratio, just apply max bounds
        targetWidth = srcWidth;
        targetHeight = srcHeight;
        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }
      }

      targetWidth = Math.round(targetWidth);
      targetHeight = Math.round(targetHeight);

      const targetRatio = targetWidth / targetHeight;

      // Step 2: Handle crop mode
      if (mode === 'cover') {
        // Scale source to cover target, then crop
        if (srcRatio > targetRatio) {
          // Source is wider, crop sides
          sh = srcHeight;
          sw = srcHeight * targetRatio;
          const offset = getCropOffset(cropPosition, srcWidth, srcHeight, sw, sh);
          sx = offset.sx;
          sy = 0;
        } else {
          // Source is taller, crop top/bottom
          sw = srcWidth;
          sh = srcWidth / targetRatio;
          const offset = getCropOffset(cropPosition, srcWidth, srcHeight, sw, sh);
          sx = 0;
          sy = offset.sy;
        }
      } else if (mode === 'contain') {
        // Fit within target, maintaining aspect ratio (may have letterboxing if drawing to fixed canvas)
        // For output, we adjust target dimensions to match source ratio
        if (!exactWidth && !exactHeight && !aspectRatio) {
          // Already handled above
        } else if (srcRatio > targetRatio) {
          // Source is wider, fit by width
          targetHeight = Math.round(targetWidth / srcRatio);
        } else {
          // Source is taller, fit by height
          targetWidth = Math.round(targetHeight * srcRatio);
        }
      }
      // mode === 'fill': stretch to exact dimensions (no adjustment needed)

      // Create canvas and draw
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);

      // Determine output format
      let mimeType: string;
      if (format === 'original') {
        mimeType = file.type || 'image/jpeg';
      } else {
        mimeType = `image/${format}`;
      }

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width: targetWidth, height: targetHeight });
          } else {
            reject(new Error('Could not create blob'));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };

    img.src = url;
  });
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };

    img.src = url;
  });
}

export function ImageUploader({
  onUpload,
  resizeOptions = DEFAULT_RESIZE_OPTIONS,
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

        const originalDimensions = await getImageDimensions(file);
        const { blob, width, height } = await resizeImage(file, resizeOptions);

        const resizedFile = new File([blob], file.name, { type: blob.type });
        const preview = URL.createObjectURL(blob);

        results.push({
          id: generateId(),
          file: resizedFile,
          originalFile: file,
          preview,
          width,
          height,
          originalWidth: originalDimensions.width,
          originalHeight: originalDimensions.height,
          size: blob.size,
          originalSize: file.size,
        });
      }

      onUpload?.(results);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onUpload, resizeOptions, multiple, maxFiles]);

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
