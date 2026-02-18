import { ContentPanel } from '../components/ContentPanel';
import { Button } from '../../components/Button';
import { Mail, Plus, Trash2, Settings, Heart, ChevronRight } from 'lucide-react';

export function ExampleButtons() {
  return (
    <div className="grid gap-4">

      {/* Solid */}
      <ContentPanel title="Solid">
        <div className="flex gap-2 flex-wrap border border-line bg-surface p-card">
          <Button>Default</Button>
          <Button color="primary">Primary</Button>
          <Button color="secondary">Secondary</Button>
          <Button color="danger">Danger</Button>
          <Button color="success">Success</Button>
          <Button disabled>Disabled</Button>
        </div>
        <details>
          <summary className="text-sm cursor-pointer opacity-60 py-1">CSS classes</summary>
          <div className="flex gap-2 flex-wrap border border-line bg-surface p-card mt-1">
            <button className="btn">Default</button>
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-danger">Danger</button>
            <button className="btn btn-success">Success</button>
            <button className="btn disabled">Disabled</button>
          </div>
        </details>
      </ContentPanel>

      {/* Outline */}
      <ContentPanel title="Outline">
        <div className="flex gap-2 flex-wrap border border-line bg-surface p-card">
          <Button variant="outline">Default</Button>
          <Button variant="outline" color="primary">Primary</Button>
          <Button variant="outline" color="secondary">Secondary</Button>
          <Button variant="outline" color="danger">Danger</Button>
          <Button variant="outline" color="success">Success</Button>
          <Button variant="outline" disabled>Disabled</Button>
        </div>
        <details>
          <summary className="text-sm cursor-pointer opacity-60 py-1">CSS classes</summary>
          <div className="flex gap-2 flex-wrap border border-line bg-surface p-card mt-1">
            <button className="btn btn-outline-default">Default</button>
            <button className="btn btn-outline-primary">Primary</button>
            <button className="btn btn-outline-secondary">Secondary</button>
            <button className="btn btn-outline-danger">Danger</button>
            <button className="btn btn-outline-success">Success</button>
            <button className="btn btn-outline-default disabled">Disabled</button>
          </div>
        </details>
      </ContentPanel>

      {/* Ghost */}
      <ContentPanel title="Ghost">
        <div className="flex gap-2 flex-wrap border border-line bg-surface p-card">
          <Button variant="ghost">Default</Button>
          <Button variant="ghost" color="primary">Primary</Button>
          <Button variant="ghost" color="secondary">Secondary</Button>
          <Button variant="ghost" color="danger">Danger</Button>
          <Button variant="ghost" color="success">Success</Button>
          <Button variant="ghost" disabled>Disabled</Button>
        </div>
        <details>
          <summary className="text-sm cursor-pointer opacity-60 py-1">CSS classes</summary>
          <div className="flex gap-2 flex-wrap border border-line bg-surface p-card mt-1">
            <button className="btn btn-ghost-default">Default</button>
            <button className="btn btn-ghost-primary">Primary</button>
            <button className="btn btn-ghost-secondary">Secondary</button>
            <button className="btn btn-ghost-danger">Danger</button>
            <button className="btn btn-ghost-success">Success</button>
            <button className="btn btn-ghost-default disabled">Disabled</button>
          </div>
        </details>
      </ContentPanel>

      {/* Sizes */}
      <ContentPanel title="Sizes">
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <Button variant="outline" size="xs">Extra Small</Button>
          <Button variant="outline" size="sm">Small</Button>
          <Button variant="outline" size="md">Medium</Button>
          <Button variant="outline" size="lg">Large</Button>
        </div>
      </ContentPanel>

      {/* Icon + Text */}
      <ContentPanel title="Icon + Text">
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <Button size="xs" color="primary"><Mail /> Lucide</Button>
          <Button size="xs" color="primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Inline SVG</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <Button size="xs" color="primary"><Mail /> Send</Button>
          <Button size="sm" color="primary"><Mail /> Send</Button>
          <Button color="primary"><Mail /> Send</Button>
          <Button size="lg" color="primary"><Mail /> Send</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <Button color="success"><Plus /> Create</Button>
          <Button color="danger"><Trash2 /> Delete</Button>
          <Button variant="outline">Next <ChevronRight /></Button>
          <Button variant="ghost"><Settings /> Settings</Button>
        </div>
      </ContentPanel>

      {/* Icon Only */}
      <ContentPanel title="Icon Only">
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <Button size="icon-xs" variant="outline"><Mail /></Button>
          <Button size="icon-sm" variant="outline"><Mail /></Button>
          <Button size="icon" variant="outline"><Mail /></Button>
          <Button size="icon-lg" variant="outline"><Mail /></Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <Button size="icon" color="primary"><Plus /></Button>
          <Button size="icon" color="danger"><Trash2 /></Button>
          <Button size="icon" variant="ghost"><Settings /></Button>
          <Button size="icon" variant="outline" color="danger"><Heart /></Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <Button size="icon-xs" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary"><Mail /></Button>
          <Button size="icon-sm" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary"><Mail /></Button>
          <Button size="icon" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary"><Mail /></Button>
          <Button size="icon-lg" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary"><Mail /></Button>
        </div>
      </ContentPanel>

      {/* Button Group */}
      <ContentPanel title="Button Group">
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <div className="btn-group">
            <Button variant="outline">Left</Button>
            <Button variant="outline">Center</Button>
            <Button variant="outline">Right</Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <div className="btn-group">
            <Button color="primary">One</Button>
            <Button color="primary">Two</Button>
            <Button color="primary">Three</Button>
          </div>
          <div className="btn-group">
            <Button variant="outline" color="danger">Delete</Button>
            <Button variant="outline" color="danger" size="icon"><Trash2 /></Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <div className="btn-group">
            <Button variant="outline" size="sm">Small</Button>
            <Button variant="outline" size="sm">Group</Button>
          </div>
          <div className="btn-group">
            <Button variant="outline">Medium</Button>
            <Button variant="outline">Group</Button>
          </div>
          <div className="btn-group">
            <Button variant="outline" size="lg">Large</Button>
            <Button variant="outline" size="lg">Group</Button>
          </div>
        </div>
      </ContentPanel>

    </div>
  );
}
