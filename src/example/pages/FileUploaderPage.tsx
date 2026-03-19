import { useState } from 'react';
import { FileUploader, UploadedFile, FileRejection } from '../../components/FileUploader';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function FileUploaderPage() {
  const [basicFiles, setBasicFiles] = useState<UploadedFile[]>([]);
  const [multiFiles, setMultiFiles] = useState<UploadedFile[]>([]);
  const [rejections, setRejections] = useState<FileRejection[]>([]);

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
            onRemove={(file) => setBasicFiles(prev => prev.filter(f => f.id !== file.id))}
          />
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
            onRemove={(file) => setMultiFiles(prev => prev.filter(f => f.id !== file.id))}
            accept="image/*,.pdf"
            multiple
            maxFiles={5}
            maxFileSize={1024 * 1024}
            onReject={(r) => setRejections(r)}
          />
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
          <FileUploader disabled />
        </div>
      </div>
    </div>
  );
}
