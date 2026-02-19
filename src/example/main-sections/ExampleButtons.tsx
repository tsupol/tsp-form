import { Button } from '../../components/Button';
import { Mail, Plus, Trash2, Settings, Heart, ChevronRight } from 'lucide-react';

export function ExampleButtons() {
  return (
    <div className="page-content grid gap-4">

      {/* Solid */}
      <section>
        <h3 className="heading-3 mb-3">Solid</h3>
        <div className="flex gap-2 flex-wrap card">
          <Button>Default</Button>
          <Button color="primary">Primary</Button>
          <Button color="secondary">Secondary</Button>
          <Button color="danger">Danger</Button>
          <Button color="success">Success</Button>
          <Button disabled>Disabled</Button>
        </div>
        <details>
          <summary className="text-sm cursor-pointer text-muted py-1">CSS classes</summary>
          <div className="flex gap-2 flex-wrap card mt-1">
            <button className="btn">Default</button>
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-danger">Danger</button>
            <button className="btn btn-success">Success</button>
            <button className="btn disabled">Disabled</button>
          </div>
        </details>
      </section>

      {/* Outline */}
      <section>
        <h3 className="heading-3 mb-3">Outline</h3>
        <div className="flex gap-2 flex-wrap card">
          <Button variant="outline">Default</Button>
          <Button variant="outline" color="primary">Primary</Button>
          <Button variant="outline" color="secondary">Secondary</Button>
          <Button variant="outline" color="danger">Danger</Button>
          <Button variant="outline" color="success">Success</Button>
          <Button variant="outline" disabled>Disabled</Button>
        </div>
        <details>
          <summary className="text-sm cursor-pointer text-muted py-1">CSS classes</summary>
          <div className="flex gap-2 flex-wrap card mt-1">
            <button className="btn btn-outline-default">Default</button>
            <button className="btn btn-outline-primary">Primary</button>
            <button className="btn btn-outline-secondary">Secondary</button>
            <button className="btn btn-outline-danger">Danger</button>
            <button className="btn btn-outline-success">Success</button>
            <button className="btn btn-outline-default disabled">Disabled</button>
          </div>
        </details>
      </section>

      {/* Ghost */}
      <section>
        <h3 className="heading-3 mb-3">Ghost</h3>
        <div className="flex gap-2 flex-wrap card">
          <Button variant="ghost">Default</Button>
          <Button variant="ghost" color="primary">Primary</Button>
          <Button variant="ghost" color="secondary">Secondary</Button>
          <Button variant="ghost" color="danger">Danger</Button>
          <Button variant="ghost" color="success">Success</Button>
          <Button variant="ghost" disabled>Disabled</Button>
        </div>
        <details>
          <summary className="text-sm cursor-pointer text-muted py-1">CSS classes</summary>
          <div className="flex gap-2 flex-wrap card mt-1">
            <button className="btn btn-ghost-default">Default</button>
            <button className="btn btn-ghost-primary">Primary</button>
            <button className="btn btn-ghost-secondary">Secondary</button>
            <button className="btn btn-ghost-danger">Danger</button>
            <button className="btn btn-ghost-success">Success</button>
            <button className="btn btn-ghost-default disabled">Disabled</button>
          </div>
        </details>
      </section>

      {/* Sizes */}
      <section>
        <h3 className="heading-3 mb-3">Sizes</h3>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button variant="outline" size="xs">Extra Small</Button>
          <Button variant="outline" size="sm">Small</Button>
          <Button variant="outline" size="md">Medium</Button>
          <Button variant="outline" size="lg">Large</Button>
        </div>
      </section>

      {/* Icon + Text */}
      <section>
        <h3 className="heading-3 mb-3">Icon + Text</h3>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="xs" color="primary"><Mail /> Lucide</Button>
          <Button size="xs" color="primary"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Inline SVG</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="xs" color="primary"><Mail /> Send</Button>
          <Button size="sm" color="primary"><Mail /> Send</Button>
          <Button color="primary"><Mail /> Send</Button>
          <Button size="lg" color="primary"><Mail /> Send</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button color="success"><Plus /> Create</Button>
          <Button color="danger"><Trash2 /> Delete</Button>
          <Button variant="outline">Next <ChevronRight /></Button>
          <Button variant="ghost"><Settings /> Settings</Button>
        </div>
      </section>

      {/* Icon Only */}
      <section>
        <h3 className="heading-3 mb-3">Icon Only</h3>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="icon-xs" variant="outline"><Mail /></Button>
          <Button size="icon-sm" variant="outline"><Mail /></Button>
          <Button size="icon" variant="outline"><Mail /></Button>
          <Button size="icon-lg" variant="outline"><Mail /></Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="icon" color="primary"><Plus /></Button>
          <Button size="icon" color="danger"><Trash2 /></Button>
          <Button size="icon" variant="ghost"><Settings /></Button>
          <Button size="icon" variant="outline" color="danger"><Heart /></Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="icon-xs" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary"><Mail /></Button>
          <Button size="icon-sm" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary"><Mail /></Button>
          <Button size="icon" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary"><Mail /></Button>
          <Button size="icon-lg" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary"><Mail /></Button>
        </div>
      </section>

    </div>
  );
}
