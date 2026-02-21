import '../../styles/alert.css';
import { useSnackbarContext } from '../../context/SnackbarContext';
import { Button } from '../../components/Button';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export function AlertPage() {
  const { addSnackbar } = useSnackbarContext();

  return (
    <div className="page-content">
      <div className="grid gap-4">
        <h1 className="heading-1">Alert</h1>
        <p className="text-muted">CSS-only alert classes for inline messages and snackbar content.</p>

        {/* All variants */}
        <section>
          <h3 className="heading-3 mb-3">Variants</h3>
          <div className="grid gap-3">
            <div className="alert alert-info">
              <Info />
              <div>
                <div className="alert-title">Information</div>
                <div className="alert-description">This is an informational message with details.</div>
              </div>
            </div>
            <div className="alert alert-success">
              <CheckCircle />
              <div>
                <div className="alert-title">Success</div>
                <div className="alert-description">Your changes have been saved successfully.</div>
              </div>
            </div>
            <div className="alert alert-warning">
              <AlertTriangle />
              <div>
                <div className="alert-title">Warning</div>
                <div className="alert-description">Please review the following items before continuing.</div>
              </div>
            </div>
            <div className="alert alert-danger">
              <XCircle />
              <div>
                <div className="alert-title">Error</div>
                <div className="alert-description">Something went wrong. Please try again later.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Title only */}
        <section>
          <h3 className="heading-3 mb-3">Title Only</h3>
          <div className="grid gap-3">
            <div className="alert alert-info">
              <Info />
              <div>
                <div className="alert-title">A quick heads-up about your account.</div>
              </div>
            </div>
            <div className="alert alert-success">
              <CheckCircle />
              <div>
                <div className="alert-title">All tasks completed.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Description only */}
        <section>
          <h3 className="heading-3 mb-3">Description Only</h3>
          <div className="grid gap-3">
            <div className="alert alert-warning">
              <AlertTriangle />
              <div>
                <div className="alert-description">Your session will expire in 5 minutes.</div>
              </div>
            </div>
            <div className="alert alert-danger">
              <XCircle />
              <div>
                <div className="alert-description">Unable to connect to the server. Check your network.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Without icon */}
        <section>
          <h3 className="heading-3 mb-3">Without Icon</h3>
          <div className="grid gap-3">
            <div className="alert alert-info">
              <div>
                <div className="alert-title">No icon</div>
                <div className="alert-description">Alerts work without an icon too.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Snackbar integration */}
        <section>
          <h3 className="heading-3 mb-3">Snackbar Integration</h3>
          <p className="text-muted mb-3">Alert content inside snackbar notifications.</p>
          <div className="flex gap-2 flex-wrap card">
            <Button variant="outline" onClick={() => addSnackbar({
              message: (
                <div className="alert alert-info">
                  <Info size={18} />
                  <div>
                    <div className="alert-title">Update Available</div>
                    <div className="alert-description">A new version is ready to install.</div>
                  </div>
                </div>
              ),
              type: 'info',
              duration: 5000,
            })}>
              Info
            </Button>
            <Button variant="outline" onClick={() => addSnackbar({
              message: (
                <div className="alert alert-success">
                  <CheckCircle size={18} />
                  <div>
                    <div className="alert-title">Saved</div>
                    <div className="alert-description">Your changes have been saved.</div>
                  </div>
                </div>
              ),
              type: 'success',
              duration: 5000,
            })}>
              Success
            </Button>
            <Button variant="outline" onClick={() => addSnackbar({
              message: (
                <div className="alert alert-warning">
                  <AlertTriangle size={18} />
                  <div>
                    <div className="alert-title">Caution</div>
                    <div className="alert-description">This action cannot be undone.</div>
                  </div>
                </div>
              ),
              type: 'warning',
              duration: 5000,
            })}>
              Warning
            </Button>
            <Button variant="outline" onClick={() => addSnackbar({
              message: (
                <div className="alert alert-danger">
                  <XCircle size={18} />
                  <div>
                    <div className="alert-title">Failed</div>
                    <div className="alert-description">Could not save your changes.</div>
                  </div>
                </div>
              ),
              type: 'error',
              duration: 5000,
            })}>
              Error
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
