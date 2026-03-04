import { Button } from '../../components/Button';
import { Mail, Plus, Trash2, Settings, Heart, ChevronRight, ChevronDown, Upload, Filter, ExternalLink, Download } from 'lucide-react';

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
          <Button size="xs" color="primary" startIcon={<Mail className="w-5 h-5" />}>Lucide</Button>
          <Button size="xs" color="primary" startIcon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}>Inline SVG</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="xs" color="primary" startIcon={<Mail />}>Send</Button>
          <Button size="sm" color="primary" startIcon={<Mail />}>Send</Button>
          <Button color="primary" startIcon={<Mail />}>Send</Button>
          <Button size="lg" color="primary" startIcon={<Mail />}>Send</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button color="success" startIcon={<Plus />}>Create</Button>
          <Button color="danger" startIcon={<Trash2 />}>Delete</Button>
          <Button variant="outline" endIcon={<ChevronRight />}>Next</Button>
          <Button variant="ghost" startIcon={<Settings />}>Settings</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="xs" color="primary" startIcon={<Upload />} endIcon={<ChevronDown />}>Upload</Button>
          <Button size="xs" variant="outline" startIcon={<Filter />} endIcon={<ChevronDown />}>Filter</Button>
          <Button size="xs" color="secondary" startIcon={<Download />} endIcon={<ExternalLink />}>Export</Button>
          <Button size="xs" variant="outline" startIcon={<Plus />} endIcon={<ChevronDown />}>Add</Button>
          <Button size="xs" color="primary" startIcon={<Mail />} endIcon={<ChevronRight />}>Send</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="sm" color="primary" startIcon={<Upload />} endIcon={<ChevronDown />}>Upload</Button>
          <Button size="sm" variant="outline" startIcon={<Filter />} endIcon={<ChevronDown />}>Filter</Button>
          <Button size="sm" color="secondary" startIcon={<Download />} endIcon={<ExternalLink />}>Export</Button>
          <Button size="sm" variant="outline" startIcon={<Plus />} endIcon={<ChevronDown />}>Add</Button>
          <Button size="sm" color="primary" startIcon={<Mail />} endIcon={<ChevronRight />}>Send</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button color="primary" startIcon={<Upload />} endIcon={<ChevronDown />}>Upload</Button>
          <Button variant="outline" startIcon={<Filter />} endIcon={<ChevronDown />}>Filter</Button>
          <Button color="secondary" startIcon={<Download />} endIcon={<ExternalLink />}>Export</Button>
          <Button variant="outline" startIcon={<Plus />} endIcon={<ChevronDown />}>Add</Button>
          <Button color="primary" startIcon={<Mail />} endIcon={<ChevronRight />}>Send</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="lg" color="primary" startIcon={<Upload />} endIcon={<ChevronDown />}>Upload</Button>
          <Button size="lg" variant="outline" startIcon={<Filter />} endIcon={<ChevronDown />}>Filter</Button>
          <Button size="lg" color="secondary" startIcon={<Download />} endIcon={<ExternalLink />}>Export</Button>
          <Button size="lg" variant="outline" startIcon={<Plus />} endIcon={<ChevronDown />}>Add</Button>
          <Button size="lg" color="primary" startIcon={<Mail />} endIcon={<ChevronRight />}>Send</Button>
        </div>
      </section>

      {/* Icon Spacing Fix */}
      <section>
        <h3 className="heading-3 mb-3">Icon Spacing Fix</h3>
        <p className="text-muted mb-3">Narrow icons like chevrons can look visually loose. Use negative margin on the icon to tighten.</p>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button variant="outline" endIcon={<ChevronRight />}>Next</Button>
          <Button variant="outline" endIcon={<ChevronRight className="-mr-1" />}>Next (fixed)</Button>
          <Button variant="outline" startIcon={<ChevronRight className="-ml-1" />}>Prev</Button>
          <Button color="primary" startIcon={<Upload />} endIcon={<ChevronDown className="-mr-0.5" />}>Upload</Button>
        </div>
      </section>

      {/* Icon Only */}
      <section>
        <h3 className="heading-3 mb-3">Icon Only</h3>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="xs" variant="outline" startIcon={<Mail />} />
          <Button size="sm" variant="outline" startIcon={<Mail />} />
          <Button variant="outline" startIcon={<Mail />} />
          <Button size="lg" variant="outline" startIcon={<Mail />} />
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button color="primary" startIcon={<Plus />} />
          <Button color="danger" startIcon={<Trash2 />} />
          <Button variant="ghost" startIcon={<Settings />} />
          <Button variant="outline" color="danger" startIcon={<Heart />} />
        </div>
        <div className="flex gap-2 flex-wrap items-center card">
          <Button size="xs" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary" startIcon={<Mail />} />
          <Button size="sm" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary" startIcon={<Mail />} />
          <Button style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary" startIcon={<Mail />} />
          <Button size="lg" style={{'--radius-button': '9999px'} as React.CSSProperties} color="primary" startIcon={<Mail />} />
        </div>
      </section>

    </div>
  );
}
