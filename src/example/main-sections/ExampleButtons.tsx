import { ContentPanel } from '../components/ContentPanel';
import { Button } from '../../components/Button';

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
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex gap-2 flex-wrap items-center border border-line bg-surface p-card">
          <Button variant="outline" size="sm">Small</Button>
          <Button variant="outline" size="md">Medium</Button>
          <Button variant="outline" size="lg">Large</Button>
        </div>
      </ContentPanel>

    </div>
  );
}
