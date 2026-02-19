export function ExampleTypography() {
  return (
    <div className="page-content grid gap-8">
      {/* Headings */}
      <section className="card space-y-4">
        <h2 className="heading-3">Headings</h2>
        <p className="text-sm text-muted">
          Use <code>.heading-1</code> through <code>.heading-4</code> for consistent heading styles driven by CSS variables.
        </p>
        <div className="space-y-3">
          <div className="heading-1">heading-1 — Page Title</div>
          <div className="heading-2">heading-2 — Section Title</div>
          <div className="heading-3">heading-3 — Subsection</div>
          <div className="heading-4">heading-4 — Minor Heading</div>
        </div>
      </section>

      {/* Text Muted */}
      <section className="card space-y-4">
        <h2 className="heading-3">Muted Text</h2>
        <p className="text-sm text-muted">
          Use <code>.text-muted</code> for secondary, de-emphasized text. Uses <code>--color-fg-muted</code> which adapts to light/dark theme.
        </p>
        <div className="space-y-2">
          <p>This is normal text.</p>
          <p className="text-muted">This is muted text — great for descriptions and secondary info.</p>
          <p className="text-small text-muted">This is small muted text — for captions and footnotes.</p>
        </div>
      </section>

      {/* Text Small */}
      <section className="card space-y-4">
        <h2 className="heading-3">Small Text</h2>
        <p className="text-sm text-muted">
          Use <code>.text-small</code> for smaller body text (0.8125rem).
        </p>
        <div className="space-y-2">
          <p>Default body text at base size.</p>
          <p className="text-small">Small text for captions, labels, and secondary content.</p>
        </div>
      </section>

      {/* Card */}
      <section className="card space-y-4">
        <h2 className="heading-3">Card Layout</h2>
        <p className="text-sm text-muted">
          Use <code>.card</code> to replace <code>border border-line bg-surface p-card rounded-lg</code>.
        </p>
        <div className="card">
          <p>This is a nested card using the <code>.card</code> class.</p>
        </div>
      </section>

      {/* Divider */}
      <section className="card space-y-4">
        <h2 className="heading-3">Dividers</h2>
        <p className="text-sm text-muted">
          Use <code>.divider</code> (2rem margin) or <code>.divider-sm</code> (1rem margin) for horizontal rules.
        </p>
        <div>
          <p>Content above</p>
          <hr className="divider-sm" />
          <p>Content below (divider-sm)</p>
          <hr className="divider" />
          <p>Content below (divider)</p>
        </div>
      </section>

      {/* CSS Variables */}
      <section className="card space-y-4">
        <h2 className="heading-3">CSS Variables</h2>
        <p className="text-sm text-muted">
          All typography classes are driven by CSS custom properties, making them easy to override.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="text-left py-2 pr-4 font-semibold">Variable</th>
                <th className="text-left py-2 pr-4 font-semibold">Default</th>
                <th className="text-left py-2 font-semibold">Used by</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-line">
                <td className="py-2 pr-4 font-mono text-xs">--text-h1</td>
                <td className="py-2 pr-4">1.5rem / 700</td>
                <td className="py-2">.heading-1</td>
              </tr>
              <tr className="border-b border-line">
                <td className="py-2 pr-4 font-mono text-xs">--text-h2</td>
                <td className="py-2 pr-4">1.25rem / 600</td>
                <td className="py-2">.heading-2</td>
              </tr>
              <tr className="border-b border-line">
                <td className="py-2 pr-4 font-mono text-xs">--text-h3</td>
                <td className="py-2 pr-4">1.125rem / 600</td>
                <td className="py-2">.heading-3</td>
              </tr>
              <tr className="border-b border-line">
                <td className="py-2 pr-4 font-mono text-xs">--text-h4</td>
                <td className="py-2 pr-4">1rem / 600</td>
                <td className="py-2">.heading-4</td>
              </tr>
              <tr className="border-b border-line">
                <td className="py-2 pr-4 font-mono text-xs">--text-small</td>
                <td className="py-2 pr-4">0.8125rem</td>
                <td className="py-2">.text-small</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono text-xs">--color-fg-muted</td>
                <td className="py-2 pr-4">#8b8d98 / #60646c</td>
                <td className="py-2">.text-muted, Slider, ImageUploader</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
