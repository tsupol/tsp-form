import { useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { FileUploader, UploadedFile, FileRejection } from '../../components/FileUploader';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function DropZone({ isDragging, label }: { isDragging: boolean; label?: string }) {
  return (
    <div className="image-uploader">
      <div className="image-uploader-content">
        <Upload size={24} className="opacity-50" />
        <span className="text-sm">{isDragging ? 'Drop files here' : (label ?? 'Click or drag files')}</span>
      </div>
    </div>
  );
}

function FileList({ files, onRemove }: { files: UploadedFile[]; onRemove: (f: UploadedFile) => void }) {
  if (files.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-3">
      {files.map((f) => (
        <div key={f.id} className="flex items-center gap-3 px-3 py-2 border border-line rounded-md bg-surface">
          <FileText size={16} className="opacity-50 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{f.name}</div>
            <div className="text-xs text-muted">{formatBytes(f.size)}{f.type ? ` · ${f.type}` : ''}</div>
          </div>
          <button
            type="button"
            className="shrink-0 opacity-50 hover:opacity-100 hover:text-danger cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onRemove(f); }}
            aria-label={`Remove ${f.name}`}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function FileUploaderPage() {
  const [basicFiles, setBasicFiles] = useState<UploadedFile[]>([]);
  const [multiFiles, setMultiFiles] = useState<UploadedFile[]>([]);
  const [rejections, setRejections] = useState<FileRejection[]>([]);

  const handleRemoveBasic = (f: UploadedFile) => setBasicFiles(prev => prev.filter(x => x.id !== f.id));
  const handleRemoveMulti = (f: UploadedFile) => setMultiFiles(prev => prev.filter(x => x.id !== f.id));

  return (
    <div className="page-content">
      <div className="grid gap-6 max-w-[800px]">
        <h1 className="heading-1">File Uploader</h1>

        {/* Basic */}
        <div className="card space-y-4">
          <h3 className="heading-3">Basic Upload</h3>
          <p className="text-muted text-sm">Single file upload with no restrictions.</p>
          <FileUploader
            value={basicFiles}
            onUpload={(files) => setBasicFiles(prev => [...prev, ...files])}
          >
            {(isDragging) => <DropZone isDragging={isDragging} />}
          </FileUploader>
          <FileList files={basicFiles} onRemove={handleRemoveBasic} />
        </div>

        {/* Multiple with validation */}
        <div className="card space-y-4">
          <h3 className="heading-3">Multiple with Validation</h3>
          <p className="text-muted text-sm">
            Max 5 files, 1 MB per file. Accepts images and PDFs only.
          </p>
          <FileUploader
            value={multiFiles}
            onUpload={(files) => setMultiFiles(prev => [...prev, ...files])}
            accept="image/*,.pdf"
            multiple
            maxFiles={5}
            maxFileSize={1024 * 1024}
            onReject={(r) => setRejections(r)}
          >
            {(isDragging) => <DropZone isDragging={isDragging} label="Click or drag images / PDFs" />}
          </FileUploader>
          <FileList files={multiFiles} onRemove={handleRemoveMulti} />
          {rejections.length > 0 && (
            <div className="text-sm text-danger">
              {rejections.map((r, i) => (
                <div key={i}>
                  {r.file.name}: {r.reason === 'too-large' ? `Too large (${formatBytes(r.file.size)})` : 'Too many files'}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disabled */}
        <div className="card space-y-4">
          <h3 className="heading-3">Disabled</h3>
          <FileUploader disabled>
            {(isDragging) => <DropZone isDragging={isDragging} />}
          </FileUploader>
        </div>
      </div>
    </div>
  );
}
