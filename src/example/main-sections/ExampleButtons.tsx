import { ContentPanel } from '../components/ContentPanel';
import { Button } from '../../components/Button';

export function ExampleButtons() {
  return (
    <div className="grid gap-4">
      <ContentPanel title="CSS Buttons">
        <div className="flex gap-2 border border-line bg-surface p-card">
          <button className="btn">
            Button
          </button>
          <button className="btn btn-primary">
            Button Primary
          </button>
          <button className="btn btn-secondary">
            Button Secondary
          </button>
          <button className="btn btn-secondary disabled">
            Button Secondary
          </button>
        </div>
        <div className="flex gap-2 border border-line bg-surface p-card">
          <button className="btn btn-outline-default">
            Button
          </button>
          <button className="btn btn-outline-primary">
            Button Primary
          </button>
          <button className="btn btn-outline-secondary">
            Outline Secondary
          </button>
          <button className="btn btn-outline-secondary disabled">
            Outline Secondary
          </button>
        </div>
        <div className="flex gap-2 border border-line bg-surface p-card">
          <button className="btn btn-ghost-default">
            Ghost
          </button>
          <button className="btn btn-ghost-primary">
            Ghost Primary
          </button>
          <button className="btn btn-ghost-secondary">
            Ghost Secondary
          </button>
          <button className="btn btn-ghost-secondary disabled">
            Ghost Secondary
          </button>
        </div>
        <div className="flex gap-2 border border-line bg-surface p-card">
          <button className="btn btn-lg">
            Large
          </button>
          <button className="btn btn-sm">
            Small
          </button>
          <button className="btn btn-outline-default btn-lg">
            Large
          </button>
          <div>
            <button className="btn btn-outline-secondary btn-sm">
              Small
            </button>
          </div>
        </div>
      </ContentPanel>
      <ContentPanel title="React Buttons">
        <div className="flex gap-2 border border-line bg-surface p-card">
          <Button>
            Button
          </Button>
          <Button color="primary">
            Button Primary
          </Button>
          <Button color="secondary">
            Button Secondary
          </Button>
          <Button color="secondary" disabled>
            Button Secondary
          </Button>
        </div>
        <div className="flex gap-2 border border-line bg-surface p-card">
          <Button variant="outline">
            Button
          </Button>
          <Button variant="outline" color="primary">
            Button Primary
          </Button>
          <Button variant="outline" color="secondary">
            Outline Secondary
          </Button>
          <Button variant="outline" color="secondary" disabled>
            Outline Secondary
          </Button>
        </div>
        <div className="flex gap-2 border border-line bg-surface p-card">
          <Button variant="ghost">
            Ghost
          </Button>
          <Button variant="ghost" color="primary">
            Ghost Primary
          </Button>
          <Button variant="ghost" color="secondary">
            Ghost Secondary
          </Button>
          <Button variant="ghost" color="secondary" disabled>
            Ghost Secondary
          </Button>
        </div>
        <div className="flex gap-2 border border-line bg-surface p-card">
          <Button size="lg">
            Large
          </Button>
          <Button size="sm">
            Small
          </Button>
          <Button variant="outline" size="lg">
            Large
          </Button>
          <div>
            <Button variant="outline" size="lg">
              L
            </Button>
          </div>
          <div>
            <Button variant="outline" color="secondary" size="md">
              Medium
            </Button>
          </div>
          <div>
            <Button variant="outline" color="secondary" size="md">
              M
            </Button>
          </div>
          <div>
            <Button variant="outline" color="secondary" size="sm">
              Small
            </Button>
          </div>
          <div>
            <Button variant="outline" color="secondary" size="sm">
              S
            </Button>
          </div>
        </div>

      </ContentPanel>
    </div>
  );
}