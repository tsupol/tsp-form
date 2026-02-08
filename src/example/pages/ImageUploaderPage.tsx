import { useState } from 'react';
import { ImageUploader, UploadedImage, RESIZE_PRESETS, ASPECT_RATIOS, ResizeOptions, CropMode, CropPosition } from '../../components/ImageUploader';
import { Select } from '../../components/Select';
import { Input } from '../../components/Input';
import { LabeledCheckbox } from '../../components/LabeledCheckbox';

const presetOptions = [
  { value: 'thumbnail', label: 'Thumbnail (150px)' },
  { value: 'small', label: 'Small (320px)' },
  { value: 'medium', label: 'Medium (640px)' },
  { value: 'large', label: 'Large (1280px)' },
  { value: 'fullHD', label: 'Full HD (1920px)' },
  { value: '4k', label: '4K (3840px)' },
  { value: 'original', label: 'Original (no resize)' },
  { value: 'custom', label: 'Custom' },
];

const formatOptions = [
  { value: 'original', label: 'Original' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
];

const modeOptions = [
  { value: 'contain', label: 'Contain (fit inside)' },
  { value: 'cover', label: 'Cover (fill & crop)' },
  { value: 'fill', label: 'Fill (stretch)' },
];

const aspectRatioOptions = [
  { value: 'none', label: 'None (keep original)' },
  { value: 'square', label: 'Square (1:1)' },
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
  { value: '16:9', label: '16:9' },
  { value: '21:9', label: '21:9 (Ultrawide)' },
  { value: '3:4', label: '3:4 (Portrait)' },
  { value: '2:3', label: '2:3 (Portrait)' },
  { value: '9:16', label: '9:16 (Portrait)' },
];

const cropPositionOptions = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function ImageUploaderPage() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [preset, setPreset] = useState<string>('large');
  const [format, setFormat] = useState<string>('original');
  const [mode, setMode] = useState<CropMode>('contain');
  const [aspectRatio, setAspectRatio] = useState<string>('none');
  const [cropPosition, setCropPosition] = useState<CropPosition>('center');
  const [customWidth, setCustomWidth] = useState(1280);
  const [customHeight, setCustomHeight] = useState(1280);
  const [quality, setQuality] = useState(85);
  const [multiple, setMultiple] = useState(true);

  const buildResizeOptions = (): ResizeOptions => {
    const base = preset === 'custom'
      ? { maxWidth: customWidth, maxHeight: customHeight }
      : { ...RESIZE_PRESETS[preset as keyof typeof RESIZE_PRESETS] };

    return {
      ...base,
      quality: quality / 100,
      format: format as ResizeOptions['format'],
      mode,
      cropPosition,
      aspectRatio: aspectRatio !== 'none' ? ASPECT_RATIOS[aspectRatio as keyof typeof ASPECT_RATIOS] : undefined,
    };
  };

  const handleUpload = (newImages: UploadedImage[]) => {
    if (multiple) {
      setImages(prev => [...prev, ...newImages]);
    } else {
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages(newImages);
    }
  };

  const handleRemove = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleClearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0);
  const totalResizedSize = images.reduce((sum, img) => sum + img.size, 0);
  const savings = totalOriginalSize > 0 ? ((1 - totalResizedSize / totalOriginalSize) * 100).toFixed(1) : 0;

  return (
    <div className="page-content">
      <div className="grid gap-6 max-w-[800px]">
        {/* Settings */}
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
          <h2 className="text-xl font-bold">Image Uploader</h2>
          <p className="text-sm opacity-60">
            Upload images with client-side resizing, cropping, and format conversion.
          </p>

          {/* Row 1: Basic settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col">
              <label className="form-label">Size Preset</label>
              <Select
                options={presetOptions}
                value={preset}
                onChange={(v) => setPreset(v as string)}
                searchable={false}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Output Format</label>
              <Select
                options={formatOptions}
                value={format}
                onChange={(v) => setFormat(v as string)}
                searchable={false}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Quality (%)</label>
              <Input
                type="number"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col justify-end">
              <LabeledCheckbox
                label="Multiple files"
                checked={multiple}
                onChange={(e) => setMultiple(e.target.checked)}
              />
            </div>
          </div>

          {/* Row 2: Crop settings */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className="form-label">Crop Mode</label>
              <Select
                options={modeOptions}
                value={mode}
                onChange={(v) => setMode(v as CropMode)}
                searchable={false}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Aspect Ratio</label>
              <Select
                options={aspectRatioOptions}
                value={aspectRatio}
                onChange={(v) => setAspectRatio(v as string)}
                searchable={false}
              />
            </div>
            {mode === 'cover' && (
              <div className="flex flex-col">
                <label className="form-label">Crop Position</label>
                <Select
                  options={cropPositionOptions}
                  value={cropPosition}
                  onChange={(v) => setCropPosition(v as CropPosition)}
                  searchable={false}
                />
              </div>
            )}
          </div>

          {/* Custom dimensions */}
          {preset === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="form-label">Max Width (px)</label>
                <Input
                  type="number"
                  min={50}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col">
                <label className="form-label">Max Height (px)</label>
                <Input
                  type="number"
                  min={50}
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Uploader */}
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
          <h3 className="font-semibold">Upload Area</h3>
          <ImageUploader
            onUpload={handleUpload}
            resizeOptions={buildResizeOptions()}
            multiple={multiple}
            maxFiles={20}
          />
        </div>

        {/* Preview */}
        {images.length > 0 && (
          <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Uploaded Images ({images.length})</h3>
              <button
                className="text-sm text-danger hover:underline cursor-pointer"
                onClick={handleClearAll}
              >
                Clear all
              </button>
            </div>

            {/* Stats */}
            <div className="text-sm opacity-70 flex gap-4 flex-wrap">
              <span>Original: {formatBytes(totalOriginalSize)}</span>
              <span>Resized: {formatBytes(totalResizedSize)}</span>
              <span className="text-success">Saved: {savings}%</span>
            </div>

            {/* Grid */}
            <div className="image-preview-grid">
              {images.map((img) => (
                <div key={img.id} className="image-preview-item">
                  <img src={img.preview} alt="" />
                  <button
                    className="image-preview-remove"
                    onClick={() => handleRemove(img.id)}
                  >
                    ×
                  </button>
                  <div className="image-preview-info">
                    <span>{img.width}×{img.height}</span>
                    <span>{formatBytes(img.size)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed list */}
            <details className="text-sm">
              <summary className="cursor-pointer opacity-70 hover:opacity-100">
                Show details
              </summary>
              <div className="mt-2 space-y-2">
                {images.map((img) => (
                  <div key={img.id} className="flex justify-between items-center py-1 border-b border-line last:border-0">
                    <span className="truncate flex-1 mr-2">{img.originalFile.name}</span>
                    <span className="text-xs opacity-60 whitespace-nowrap">
                      {img.originalWidth}×{img.originalHeight} → {img.width}×{img.height} | {formatBytes(img.originalSize)} → {formatBytes(img.size)}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
