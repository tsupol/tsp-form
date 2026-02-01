import { useState, useEffect } from 'react';
import { ContentPanel } from '../components/ContentPanel';
import { ProgressBar } from '../../components/ProgressBar';
import { Button } from '../../components/Button';

export function ExampleProgressBar() {
  const [progress1, setProgress1] = useState(45);
  const [progress2, setProgress2] = useState(0);

  // Animated progress simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress2((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-4">
      <ContentPanel title="Basic Progress Bars">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Default (45%)</div>
            <ProgressBar value={45} />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">With Label</div>
            <ProgressBar value={75} showLabel />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Custom Label</div>
            <ProgressBar value={60} showLabel label="60 of 100 files" />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Colors">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Primary (default)</div>
            <ProgressBar value={70} color="primary" />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Secondary</div>
            <ProgressBar value={60} color="secondary" />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Success</div>
            <ProgressBar value={100} color="success" showLabel />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Warning</div>
            <ProgressBar value={50} color="warning" showLabel />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Danger</div>
            <ProgressBar value={25} color="danger" showLabel />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Sizes">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Small</div>
            <ProgressBar value={40} size="sm" />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Medium (default)</div>
            <ProgressBar value={60} size="md" />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Large</div>
            <ProgressBar value={80} size="lg" showLabel />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Striped & Animated">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Striped</div>
            <ProgressBar value={65} striped />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Animated Stripes</div>
            <ProgressBar value={75} striped animated />
          </div>
          <div>
            <div className="text-sm text-fg-muted mb-2">Animated Success</div>
            <ProgressBar value={90} color="success" striped animated showLabel />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Interactive Example">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Progress: {progress1}%</div>
            <ProgressBar value={progress1} showLabel size="lg" />
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => setProgress1(Math.max(0, progress1 - 10))}>
                -10%
              </Button>
              <Button size="sm" onClick={() => setProgress1(Math.min(100, progress1 + 10))}>
                +10%
              </Button>
              <Button size="sm" variant="outline" onClick={() => setProgress1(0)}>
                Reset
              </Button>
              <Button size="sm" color="success" onClick={() => setProgress1(100)}>
                Complete
              </Button>
            </div>
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Auto-animating Progress">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm text-fg-muted mb-2">Simulated loading: {progress2}%</div>
            <ProgressBar
              value={progress2}
              color={progress2 < 30 ? 'danger' : progress2 < 70 ? 'warning' : 'success'}
              showLabel
              striped
              animated
            />
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Use Cases">
        <div className="border border-line bg-surface p-card space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">File Upload</div>
            <ProgressBar value={45} showLabel label="45 MB / 100 MB" color="primary" size="lg" />
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Skills</div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-fg-muted mb-1">React</div>
                <ProgressBar value={90} color="primary" size="sm" />
              </div>
              <div>
                <div className="text-xs text-fg-muted mb-1">TypeScript</div>
                <ProgressBar value={85} color="primary" size="sm" />
              </div>
              <div>
                <div className="text-xs text-fg-muted mb-1">CSS</div>
                <ProgressBar value={75} color="primary" size="sm" />
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-2">Storage Usage</div>
            <ProgressBar value={82} color="warning" showLabel label="8.2 GB / 10 GB" striped />
          </div>
        </div>
      </ContentPanel>
    </div>
  );
}
