import { useRef, useState } from 'react';
import { ImageZoomPan, ImageZoomPanHandle } from '../../components/ImageZoomPan';
import { Button } from '../../components/Button';

const LANDSCAPE = 'https://picsum.photos/id/1015/1600/900';
const PORTRAIT = 'https://picsum.photos/id/1011/900/1200';
const SQUARE = 'https://picsum.photos/id/1025/1000/1000';

export function ImageZoomPanPage() {
  const ref = useRef<ImageZoomPanHandle>(null);
  const [scale, setScale] = useState(1);

  return (
    <div className="page-content">
      <div className="grid gap-6">
        <div>
          <h1 className="heading-1">Image Zoom &amp; Pan</h1>
          <p className="text-muted">
            Wheel-zooms toward the cursor, drag-pans with inertia, double-click toggles zoom.
            Touch: pinch zoom, drag pan.
          </p>
        </div>

        <section>
          <h3 className="heading-3 mb-2">Basic (16:9)</h3>
          <p className="text-small text-muted mb-3">
            Landscape image, container locked to <code>aspectRatio={16/9}</code>.
          </p>
          <div style={{ maxWidth: 800 }}>
            <ImageZoomPan src={LANDSCAPE} alt="landscape" aspectRatio={16 / 9} />
          </div>
        </section>

        <section>
          <h3 className="heading-3 mb-2">Portrait (3:4)</h3>
          <div style={{ maxWidth: 360 }}>
            <ImageZoomPan src={PORTRAIT} alt="portrait" aspectRatio={3 / 4} />
          </div>
        </section>

        <section>
          <h3 className="heading-3 mb-2">Square (1:1)</h3>
          <div style={{ maxWidth: 400 }}>
            <ImageZoomPan src={SQUARE} alt="square" aspectRatio={1} />
          </div>
        </section>

        <section>
          <h3 className="heading-3 mb-2">Mismatched aspect — imageFit</h3>
          <p className="text-small text-muted mb-3">
            3:4 portrait image inside a square (1:1) viewport. <code>imageFit</code> controls the fit.
          </p>
          <div className="grid grid-cols-2 gap-4" style={{ maxWidth: 700 }}>
            <div>
              <div className="text-small text-muted mb-1">imageFit="contain" (letterboxed)</div>
              <ImageZoomPan src={PORTRAIT} alt="portrait-contain" aspectRatio={1} imageFit="contain" />
            </div>
            <div>
              <div className="text-small text-muted mb-1">imageFit="cover" (filled, pannable)</div>
              <ImageZoomPan src={PORTRAIT} alt="portrait-cover" aspectRatio={1} imageFit="cover" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="heading-3 mb-2">Rubber-band (Instagram peek)</h3>
          <p className="text-small text-muted mb-3">
            With <code>rubberBand</code>, the image always snaps back to its natural scale on release —
            a "peek" gesture. Pinch in or out, then release: it animates back to 1×.
            (Wheel zoom remains persistent — only touch pinch peeks.)
          </p>
          <div style={{ maxWidth: 600 }}>
            <ImageZoomPan src={LANDSCAPE} alt="rubber-band" aspectRatio={16 / 9} rubberBand />
          </div>
        </section>

        <section>
          <h3 className="heading-3 mb-2">Desktop zoom trigger</h3>
          <p className="text-small text-muted mb-3">
            On desktop, choose between single-click or double-click to toggle zoom.
            Touch always uses double-tap (independent setting).
          </p>
          <div className="grid grid-cols-2 gap-4" style={{ maxWidth: 800 }}>
            <div>
              <div className="text-small text-muted mb-1">desktopZoomTrigger="click"</div>
              <ImageZoomPan src={SQUARE} alt="click-zoom" aspectRatio={1} desktopZoomTrigger="click" />
            </div>
            <div>
              <div className="text-small text-muted mb-1">desktopZoomTrigger="double-click" (default)</div>
              <ImageZoomPan src={SQUARE} alt="dblclick-zoom" aspectRatio={1} desktopZoomTrigger="double-click" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="heading-3 mb-2">Programmatic controls + onZoomChange</h3>
          <p className="text-small text-muted mb-3">
            Imperative handle exposes <code>zoomIn</code>, <code>zoomOut</code>, <code>reset</code>, <code>getScale</code>.
            Current scale (from <code>onZoomChange</code>): <strong>{scale.toFixed(2)}</strong>
          </p>
          <div className="flex gap-2 mb-3">
            <Button onClick={() => ref.current?.zoomIn()}>Zoom in</Button>
            <Button onClick={() => ref.current?.zoomOut()}>Zoom out</Button>
            <Button onClick={() => ref.current?.reset()} variant="outline">Reset</Button>
          </div>
          <div style={{ maxWidth: 800 }}>
            <ImageZoomPan
              ref={ref}
              src={LANDSCAPE}
              alt="landscape"
              aspectRatio={16 / 9}
              maxZoom={10}
              onZoomChange={setScale}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
