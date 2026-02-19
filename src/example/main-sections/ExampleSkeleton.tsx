import { Skeleton } from '../../components/Skeleton';

export function ExampleSkeleton() {
  return (
    <div className="page-content grid gap-4">
      <section>
        <h3 className="heading-3 mb-3">Text Variants</h3>
        <div className="card space-y-3">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </section>

      <section>
        <h3 className="heading-3 mb-3">Rectangular Variants</h3>
        <div className="card space-y-3">
          <Skeleton variant="rectangular" width={200} height={200} />
          <Skeleton variant="rectangular" width="100%" height={100} />
        </div>
      </section>

      <section>
        <h3 className="heading-3 mb-3">Circular Variants</h3>
        <div className="card flex gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="circular" width={60} height={60} />
          <Skeleton variant="circular" width={80} height={80} />
        </div>
      </section>

      <section>
        <h3 className="heading-3 mb-3">Animation Types</h3>
        <div className="card space-y-4">
          <div>
            <div className="text-sm text-muted mb-2">Pulse (default)</div>
            <Skeleton animation="pulse" width="100%" height={40} />
          </div>
          <div>
            <div className="text-sm text-muted mb-2">Wave</div>
            <Skeleton animation="wave" width="100%" height={40} />
          </div>
          <div>
            <div className="text-sm text-muted mb-2">None</div>
            <Skeleton animation="none" width="100%" height={40} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="heading-3 mb-3">Card Loading Example</h3>
        <div className="card">
          <div className="flex gap-4">
            <Skeleton variant="circular" width={60} height={60} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton variant="rectangular" width="100%" height={120} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="90%" />
            <Skeleton variant="text" width="80%" />
          </div>
        </div>
      </section>

      <section>
        <h3 className="heading-3 mb-3">List Loading Example</h3>
        <div className="card space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex gap-4 items-center">
              <Skeleton variant="circular" width={40} height={40} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="50%" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
