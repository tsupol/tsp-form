export function DebugPage() {
  const rotateClasses = [
    ['rotate-0', 0],
    ['rotate-30', 30],
    ['rotate-45', 45],
    ['rotate-60', 60],
    ['rotate-90', 90],
    ['rotate-120', 120],
    ['rotate-135', 135],
    ['rotate-150', 150],
    ['rotate-180', 180],
    ['-rotate-150', -150],
    ['-rotate-135', -135],
    ['-rotate-120', -120],
    ['-rotate-90', -90],
    ['-rotate-60', -60],
    ['-rotate-45', -45],
    ['-rotate-30', -30],
  ] as const;

  return (
    <div className="page-content">
      <div className="grid gap-4">
        <h1 className="heading-1">Debug</h1>
        <p className="text-muted">Tailwind CSS class debugging playground.</p>

        <section>
          <h3 className="heading-3 mb-3">Rotation</h3>
          <div className="card">
            <div className="relative w-80 h-80 mx-auto">
              {rotateClasses.map(([cls, deg]) => {
                const rad = (deg - 90) * (Math.PI / 180);
                const r = 42;
                const x = 50 + r * Math.cos(rad);
                const y = 50 + r * Math.sin(rad);
                return (
                  <div
                    key={deg}
                    className="absolute flex flex-col items-center gap-1"
                    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div className={`${cls} w-6 h-6 bg-primary flex items-center justify-center text-primary-contrast text-xs font-bold`}>A</div>
                    <span className="text-xs text-muted">{cls}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section>
          <h3 className="heading-3 mb-3">Ellipsis Ghost</h3>
          <p className="text-muted mb-3">Truncated text at low opacity — does the "..." ghost show?</p>
          <div className="card">
            <div className="w-48 bg-surface-hover rounded px-3 h-8 flex items-center">
              <span className="truncate opacity-0">A Very Long Title That Should Be Truncated With Ellipsis</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
