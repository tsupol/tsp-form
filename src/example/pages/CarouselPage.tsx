import { useState } from 'react';
import { Carousel } from '../../components/Carousel';
import { LabeledCheckbox } from '../../components/LabeledCheckbox';
import { Input } from '../../components/Input';

const sampleImages = [
  { bg: '#3b82f6', label: 'Slide 1 - Blue' },
  { bg: '#10b981', label: 'Slide 2 - Green' },
  { bg: '#f59e0b', label: 'Slide 3 - Amber' },
  { bg: '#ef4444', label: 'Slide 4 - Red' },
  { bg: '#8b5cf6', label: 'Slide 5 - Purple' },
];

const thumbnailImages = [
  'https://picsum.photos/seed/thumb1/800/600',
  'https://picsum.photos/seed/thumb2/800/600',
  'https://picsum.photos/seed/thumb3/800/600',
  'https://picsum.photos/seed/thumb4/800/600',
  'https://picsum.photos/seed/thumb5/800/600',
  'https://picsum.photos/seed/thumb6/800/600',
  'https://picsum.photos/seed/thumb7/800/600',
  'https://picsum.photos/seed/thumb8/800/600',
];

export function CarouselPage() {
  const [showDots, setShowDots] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [loop, setLoop] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const [swipeable, setSwipeable] = useState(true);
  const [hideControlsOnTouch, setHideControlsOnTouch] = useState(true);
  const [autoplayInterval, setAutoplayInterval] = useState(3000);

  // Controlled mode example
  const [controlledIndex, setControlledIndex] = useState(0);

  // Thumbnail examples
  const [thumbRightIndex, setThumbRightIndex] = useState(0);
  const [thumbLeftIndex, setThumbLeftIndex] = useState(0);

  return (
    <div className="page-content">
      <div className="grid gap-6 max-w-[800px]">
        {/* Basic Carousel */}
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
          <h2 className="text-xl font-bold">Basic Carousel</h2>
          <p className="text-sm opacity-60">
            A simple carousel with default settings. Drag to swipe or use arrows/dots.
          </p>
          <div className="h-64">
            <Carousel className="rounded-lg overflow-hidden">
              {sampleImages.map((img, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center h-full text-white text-2xl font-bold"
                  style={{ background: img.bg }}
                >
                  {img.label}
                </div>
              ))}
            </Carousel>
          </div>
        </div>

        {/* Configurable Carousel */}
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
          <h2 className="text-xl font-bold">Configurable Carousel</h2>
          <p className="text-sm opacity-60">
            Toggle options to see different carousel behaviors.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <LabeledCheckbox
              label="Show Dots"
              checked={showDots}
              onChange={(e) => setShowDots(e.target.checked)}
            />
            <LabeledCheckbox
              label="Show Arrows"
              checked={showArrows}
              onChange={(e) => setShowArrows(e.target.checked)}
            />
            <LabeledCheckbox
              label="Loop"
              checked={loop}
              onChange={(e) => setLoop(e.target.checked)}
            />
            <LabeledCheckbox
              label="Autoplay"
              checked={autoplay}
              onChange={(e) => setAutoplay(e.target.checked)}
            />
            <LabeledCheckbox
              label="Pause on Hover"
              checked={pauseOnHover}
              onChange={(e) => setPauseOnHover(e.target.checked)}
            />
            <LabeledCheckbox
              label="Swipeable"
              checked={swipeable}
              onChange={(e) => setSwipeable(e.target.checked)}
            />
            <LabeledCheckbox
              label="Hide Arrows on Touch"
              checked={hideControlsOnTouch}
              onChange={(e) => setHideControlsOnTouch(e.target.checked)}
            />
          </div>

          {autoplay && (
            <div className="flex items-center gap-2">
              <label className="form-label text-sm whitespace-nowrap">Interval (ms):</label>
              <Input
                type="number"
                value={autoplayInterval}
                onChange={(e) => setAutoplayInterval(Number(e.target.value))}
                className="w-24"
                min={500}
                step={500}
              />
            </div>
          )}

          <div className="h-64">
            <Carousel
              showDots={showDots}
              showArrows={showArrows}
              loop={loop}
              autoplay={autoplay}
              autoplayInterval={autoplayInterval}
              pauseOnHover={pauseOnHover}
              swipeable={swipeable}
              hideControlsOnTouch={hideControlsOnTouch}
              className="rounded-lg overflow-hidden"
            >
              {sampleImages.map((img, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center h-full text-white text-2xl font-bold"
                  style={{ background: img.bg }}
                >
                  {img.label}
                </div>
              ))}
            </Carousel>
          </div>
        </div>

        {/* Controlled Mode */}
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
          <h2 className="text-xl font-bold">Controlled Mode</h2>
          <p className="text-sm opacity-60">
            Use external state to control the active slide.
          </p>

          <div className="flex gap-2 flex-wrap">
            {sampleImages.map((_, i) => (
              <button
                key={i}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  controlledIndex === i
                    ? 'bg-primary text-primary-contrast'
                    : 'bg-surface-elevated hover:bg-line'
                }`}
                onClick={() => setControlledIndex(i)}
              >
                Slide {i + 1}
              </button>
            ))}
          </div>

          <div className="h-64">
            <Carousel
              activeIndex={controlledIndex}
              onSlideChange={setControlledIndex}
              className="rounded-lg overflow-hidden"
            >
              {sampleImages.map((img, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center h-full text-white text-2xl font-bold"
                  style={{ background: img.bg }}
                >
                  {img.label}
                </div>
              ))}
            </Carousel>
          </div>

          <p className="text-sm opacity-60">
            Current index: <span className="font-mono font-bold">{controlledIndex}</span>
          </p>
        </div>

        {/* Custom Arrows */}
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
          <h2 className="text-xl font-bold">Custom Arrows</h2>
          <p className="text-sm opacity-60">
            Provide custom content for the prev/next arrows.
          </p>

          <div className="h-48">
            <Carousel
              prevArrow={<span className="text-lg">←</span>}
              nextArrow={<span className="text-lg">→</span>}
              arrowClassName="!bg-primary !text-primary-contrast"
              dotClassName="!bg-primary"
              loop
              className="rounded-lg overflow-hidden"
            >
              {sampleImages.slice(0, 3).map((img, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center h-full text-white text-xl font-bold"
                  style={{ background: img.bg }}
                >
                  {img.label}
                </div>
              ))}
            </Carousel>
          </div>
        </div>

        {/* Image Content Example - Cover */}
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
          <h2 className="text-xl font-bold">Images with objectFit="cover"</h2>
          <p className="text-sm opacity-60">
            Images fill the slide and may be cropped (default).
          </p>

          <div className="h-64">
            <Carousel loop objectFit="cover" className="rounded-lg overflow-hidden">
              <img
                src="https://picsum.photos/seed/carousel1/800/400"
                alt="Sample 1"
              />
              <img
                src="https://picsum.photos/seed/carousel2/800/400"
                alt="Sample 2"
              />
              <img
                src="https://picsum.photos/seed/carousel3/800/400"
                alt="Sample 3"
              />
            </Carousel>
          </div>
        </div>

        {/* Image Content Example - Contain */}
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
          <h2 className="text-xl font-bold">Images with objectFit="contain"</h2>
          <p className="text-sm opacity-60">
            Images fit entirely within the slide, may have letterboxing.
          </p>

          <div className="h-64">
            <Carousel loop objectFit="contain" className="rounded-lg overflow-hidden bg-black">
              <img
                src="https://picsum.photos/seed/carousel4/600/800"
                alt="Sample 1"
              />
              <img
                src="https://picsum.photos/seed/carousel5/800/400"
                alt="Sample 2"
              />
              <img
                src="https://picsum.photos/seed/carousel6/400/600"
                alt="Sample 3"
              />
            </Carousel>
          </div>
        </div>

        {/* Thumbnail Navigation - Bottom, scrollable (align right) */}
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
          <h2 className="text-xl font-bold">Thumbnails (Bottom, Scroll Right)</h2>
          <p className="text-sm opacity-60">
            Thumbnails at bottom, aligned right, horizontally scrollable.
          </p>

          <div className="h-64">
            <Carousel
              activeIndex={thumbRightIndex}
              onSlideChange={setThumbRightIndex}
              showDots={false}
              loop
              className="rounded-lg overflow-hidden"
            >
              {thumbnailImages.map((src, i) => (
                <img key={i} src={src} alt={`Image ${i + 1}`} />
              ))}
            </Carousel>
          </div>
          <div className="flex justify-end">
            <div className="overflow-x-auto flex gap-2 max-w-full">
              {thumbnailImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setThumbRightIndex(i)}
                  className={`flex-shrink-0 rounded overflow-hidden border-2 transition-colors cursor-pointer ${
                    thumbRightIndex === i ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={src} alt={`Thumb ${i + 1}`} className="w-16 h-12 object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation - Bottom, wrapped (align left) */}
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg">
          <h2 className="text-xl font-bold">Thumbnails (Bottom, Wrap Left)</h2>
          <p className="text-sm opacity-60">
            Thumbnails at bottom, aligned left, wrapping to multiple rows.
          </p>

          <div className="h-64">
            <Carousel
              activeIndex={thumbLeftIndex}
              onSlideChange={setThumbLeftIndex}
              showDots={false}
              loop
              className="rounded-lg overflow-hidden"
            >
              {thumbnailImages.map((src, i) => (
                <img key={i} src={src} alt={`Image ${i + 1}`} />
              ))}
            </Carousel>
          </div>
          <div className="flex flex-wrap gap-2">
            {thumbnailImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setThumbLeftIndex(i)}
                className={`rounded overflow-hidden border-2 transition-colors cursor-pointer ${
                  thumbLeftIndex === i ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img src={src} alt={`Thumb ${i + 1}`} className="w-16 h-12 object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
