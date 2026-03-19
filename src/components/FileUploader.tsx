import { useState, useRef, useCallback, DragEvent, ChangeEvent, ReactNode } from 'react';
import clsx from 'clsx';
import '../styles/file-uploader.css';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
}

export interface FileRejection {
  file: File;
  reason: 'too-large' | 'too-many';
}

export interface FileUploaderProps {
  value?: UploadedFile[];
  onUpload?: (files: UploadedFile[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  onReject?: (rejections: FileRejection[]) => void;
  disabled?: boolean;
  children?: ReactNode | ((isDragging: boolean) => ReactNode);
  className?: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function FileUploader({
  value = [],
  onUpload,
  accept,
  multiple = false,
  maxFiles = 10,
  maxFileSize,
  onReject,
  disabled = false,
  children,
  className,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback((fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const accepted: UploadedFile[] = [];
    const rejected: FileRejection[] = [];

    const remainingSlots = multiple ? maxFiles - value.length : 1;

    for (let i = 0; i < incoming.length; i++) {
      const file = incoming[i];

      if (i >= remainingSlots) {
        rejected.push({ file, reason: 'too-many' });
        continue;
      }

      if (maxFileSize && file.size > maxFileSize) {
        rejected.push({ file, reason: 'too-large' });
        continue;
      }

      accepted.push({
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }

    if (accepted.length > 0) onUpload?.(accepted);
    if (rejected.length > 0) onReject?.(rejected);
  }, [multiple, maxFiles, maxFileSize, value.length, onUpload, onReject]);

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

    if (disabled) return;
    const { files } = e.dataTransfer;
    if (files && files.length > 0) processFiles(files);
  }, [disabled, processFiles]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) processFiles(files);
    e.target.value = '';
  }, [processFiles]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  return (
    <div
      className={clsx(
        'file-uploader',
        isDragging && 'file-uploader-dragging',
        disabled && 'file-uploader-disabled',
        className,
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
        className="file-uploader-input"
        disabled={disabled}
      />
      {typeof children === 'function' ? children(isDragging) : children}
    </div>
  );
}
