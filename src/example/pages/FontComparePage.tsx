import { useEffect } from 'react';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';

const googleFonts = [
  { family: 'Inter', query: 'Inter:opsz,wght@14..32,100..900' },
  { family: 'Noto Sans', query: 'Noto+Sans:wght@100..900' },
  { family: 'Noto Sans Thai', query: 'Noto+Sans+Thai:wght@100..900' },
  { family: 'Roboto', query: 'Roboto:wght@100..900' },
  { family: 'Sarabun', query: 'Sarabun:wght@100;200;300;400;500;600;700;800' },
  { family: 'Prompt', query: 'Prompt:wght@100;200;300;400;500;600;700;800;900' },
  { family: 'IBM Plex Sans Thai', query: 'IBM+Plex+Sans+Thai:wght@100;200;300;400;500;600;700' },
];

const fonts = [
  ...googleFonts.map(f => f.family),
  'system-ui',
  'Arial',
  'Segoe UI',
];

function useLoadFonts() {
  useEffect(() => {
    const families = googleFonts.map(f => `family=${f.query}`).join('&');
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;

    const existing = document.querySelector(`link[href="${href}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);
}

const ff = (font: string) => ({ fontFamily: `"${font}", sans-serif` });

const sizes = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function FontComparePage() {
  useLoadFonts();

  return (
    <div className="page-content">
      <h1 className="heading-1 mb-2">Font Comparison</h1>
      <p className="text-muted mb-6">Each section shows the same component in every font.</p>

      <div className="grid gap-6">
        {/* Button sm */}
        <section>
          <h3 className="heading-3 mb-3">Button (sm)</h3>
          <div className="card flex gap-3 flex-wrap items-start">
            {fonts.map(f => (
              <div key={f} className="flex flex-col items-center gap-1" style={ff(f)}>
                <Button size="sm">Button</Button>
                <span className="text-xs text-muted">{f}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Badge sm */}
        <section>
          <h3 className="heading-3 mb-3">Badge (sm)</h3>
          <div className="card flex gap-3 flex-wrap items-start">
            {fonts.map(f => (
              <div key={f} className="flex flex-col items-center gap-1" style={ff(f)}>
                <Badge color="primary" size="sm">Badge</Badge>
                <span className="text-xs text-muted">{f}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Font size comparison */}
        {sizes.map(size => (
          <section key={size}>
            <h3 className="heading-3 mb-3">{size}px</h3>
            <div className="card grid gap-2">
              <div className="relative">
                <div className="absolute inset-x-0 pointer-events-none" style={{ top: 0, bottom: 0 }}>
                  <div className="absolute w-full border-t border-blue-400/50" style={{ top: 0 }} />
                  <div className="absolute w-full border-t border-red-400/50" style={{ top: '50%' }} />
                  <div className="absolute w-full border-b border-blue-400/50" style={{ bottom: 0 }} />
                </div>
                <div className="flex gap-3 flex-wrap items-center">
                  {fonts.map(f => (
                    <div key={f} className="flex flex-col items-center" style={{ gap: '2px' }}>
                      <div
                        style={{ ...ff(f), fontSize: `${size}px`, lineHeight: 1, background: 'var(--color-surface-hover)' }}
                      >Test</div>
                      <span className="text-muted" style={{ fontSize: '7px', lineHeight: 1 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
