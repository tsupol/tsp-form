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
  onRemove?: (file: UploadedFile) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  onReject?: (rejections: FileRejection[]) => void;
  disabled?: boolean;
  placeholder?: ReactNode;
  className?: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function FileUploader({
  value = [],
  onUpload,
  onRemove,
  accept,
  multiple = false,
  maxFiles = 10,
  maxFileSize,
  onReject,
  disabled = false,
  placeholder,
  className,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const isDraggingRef = useRef(false);
  const forceUpdate = useForceUpdate();

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
      isDraggingRef.current = true;
      forceUpdate();
    }
  }, [forceUpdate]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      isDraggingRef.current = false;
      forceUpdate();
    }
  }, [forceUpdate]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = false;
    dragCounter.current = 0;
    forceUpdate();

    if (disabled) return;
    const { files } = e.dataTransfer;
    if (files && files.length > 0) processFiles(files);
  }, [disabled, processFiles, forceUpdate]);

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
        isDraggingRef.current && 'file-uploader-dragging',
        disabled && 'file-uploader-disabled',
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="file-uploader-dropzone" onClick={handleClick}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="file-uploader-input"
          disabled={disabled}
        />
        {placeholder || (
          <div className="file-uploader-content">
            <svg className="file-uploader-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 18a4.6 4.4 0 0 1-.7-8.8 6 6 0 0 1 11.4 0A4.6 4.4 0 0 1 17 18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 13v8M9 16l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{isDraggingRef.current ? 'Drop files here' : 'Click or drag files'}</span>
            {multiple && <span className="file-uploader-hint">Up to {maxFiles} files</span>}
            {maxFileSize && <span className="file-uploader-hint">Max {formatBytes(maxFileSize)} per file</span>}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="file-uploader-list">
          {value.map((f) => (
            <div key={f.id} className="file-uploader-item">
              <svg className="file-uploader-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div className="file-uploader-item-info">
                <span className="file-uploader-item-name">{f.name}</span>
                <span className="file-uploader-item-meta">
                  {formatBytes(f.size)}{f.type ? ` · ${f.type}` : ''}
                </span>
              </div>
              {onRemove && (
                <button
                  type="button"
                  className="file-uploader-item-remove"
                  onClick={() => onRemove(f)}
                  aria-label={`Remove ${f.name}`}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function useForceUpdate() {
  const [, set] = useState(0);
  return useCallback(() => set(c => c + 1), []);
}
