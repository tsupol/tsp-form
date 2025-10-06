import { ContentPanel } from '../components/ContentPanel';
import { Tooltip } from '../../components/Tooltip';
import { Button } from '../../components/Button';

export function ExampleTooltip() {
  return (
    <div className="grid gap-4">
      <ContentPanel title="Basic Placements">
        <div className="border border-line bg-surface p-card">
          <div className="flex flex-wrap gap-8 justify-center items-center min-h-[200px]">
            <Tooltip content="This appears on top" placement="top">
              <Button variant="outline">Top</Button>
            </Tooltip>

            <Tooltip content="This appears on the right" placement="right">
              <Button variant="outline">Right</Button>
            </Tooltip>

            <Tooltip content="This appears on the bottom" placement="bottom">
              <Button variant="outline">Bottom</Button>
            </Tooltip>

            <Tooltip content="This appears on the left" placement="left">
              <Button variant="outline">Left</Button>
            </Tooltip>
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="With Different Content">
        <div className="border border-line bg-surface p-card">
          <div className="flex flex-wrap gap-4">
            <Tooltip content="Simple text tooltip">
              <Button color="primary">Hover me</Button>
            </Tooltip>

            <Tooltip content="This is a longer tooltip with more information that might wrap to multiple lines">
              <Button color="secondary">Long content</Button>
            </Tooltip>

            <Tooltip
              content={
                <div>
                  <strong>Rich content!</strong>
                  <br />
                  You can use HTML elements
                </div>
              }
            >
              <Button color="success">Rich tooltip</Button>
            </Tooltip>
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Hover Delay">
        <div className="border border-line bg-surface p-card">
          <div className="flex flex-wrap gap-4">
            <Tooltip content="No delay" delay={0}>
              <Button variant="outline">Instant</Button>
            </Tooltip>

            <Tooltip content="Default delay (200ms)">
              <Button variant="outline">Default</Button>
            </Tooltip>

            <Tooltip content="Longer delay" delay={500}>
              <Button variant="outline">500ms delay</Button>
            </Tooltip>
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Disabled State">
        <div className="border border-line bg-surface p-card">
          <div className="flex flex-wrap gap-4">
            <Tooltip content="This tooltip is enabled">
              <Button variant="outline">Enabled tooltip</Button>
            </Tooltip>

            <Tooltip content="You won't see this" disabled>
              <Button variant="outline">Disabled tooltip</Button>
            </Tooltip>
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="On Text Elements">
        <div className="border border-line bg-surface p-card space-y-4">
          <p>
            You can add tooltips to{' '}
            <Tooltip content="This is a tooltip on inline text">
              <span className="text-primary cursor-help underline decoration-dotted">
                inline text elements
              </span>
            </Tooltip>
            {' '}to provide additional context.
          </p>

          <div className="flex gap-2 items-center">
            <span>Icon with tooltip:</span>
            <Tooltip content="Settings">
              <button className="p-2 hover:bg-surface-elevated rounded cursor-pointer">
                ⚙️
              </button>
            </Tooltip>
            <Tooltip content="Help">
              <button className="p-2 hover:bg-surface-elevated rounded cursor-pointer">
                ❓
              </button>
            </Tooltip>
            <Tooltip content="Info">
              <button className="p-2 hover:bg-surface-elevated rounded cursor-pointer">
                ℹ️
              </button>
            </Tooltip>
          </div>
        </div>
      </ContentPanel>

      <ContentPanel title="Auto-positioning">
        <div className="border border-line bg-surface p-card">
          <p className="text-sm text-fg-muted mb-4">
            Tooltips automatically flip to the opposite side if there's not enough space.
            Try scrolling or moving these near the viewport edges:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Tooltip content="I'll flip if needed" placement="top">
              <Button variant="outline" size="sm">Top Auto</Button>
            </Tooltip>
            <Tooltip content="I'll flip if needed" placement="right">
              <Button variant="outline" size="sm">Right Auto</Button>
            </Tooltip>
            <Tooltip content="I'll flip if needed" placement="bottom">
              <Button variant="outline" size="sm">Bottom Auto</Button>
            </Tooltip>
            <Tooltip content="I'll flip if needed" placement="left">
              <Button variant="outline" size="sm">Left Auto</Button>
            </Tooltip>
          </div>
        </div>
      </ContentPanel>
    </div>
  );
}
