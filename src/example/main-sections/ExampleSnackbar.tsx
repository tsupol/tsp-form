import { useState } from 'react';
import { useSnackbarContext } from '../../context/SnackbarContext';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';

export const ExampleSnackbar = () => {
  const [openModal, setOpenModal] = useState(false);
  const { addSnackbar } = useSnackbarContext();

  return (
    <div className="page-content">
      <div className="grid gap-6 max-w-[600px]">

        {/* Types */}
        <div className="border border-line bg-surface p-card space-y-3 rounded-lg">
          <h2 className="text-lg font-bold">Types</h2>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => addSnackbar({ message: 'This is an info message.', type: 'info', duration: 5000 })}>
              Info
            </Button>
            <Button variant="outline" onClick={() => addSnackbar({ message: 'Operation completed successfully!', type: 'success', duration: 5000 })}>
              Success
            </Button>
            <Button variant="outline" onClick={() => addSnackbar({ message: 'Please check your input.', type: 'warning', duration: 5000 })}>
              Warning
            </Button>
            <Button variant="outline" onClick={() => addSnackbar({ message: 'Something went wrong.', type: 'error', duration: 5000 })}>
              Error
            </Button>
          </div>
        </div>

        {/* Positions */}
        <div className="border border-line bg-surface p-card space-y-3 rounded-lg">
          <h2 className="text-lg font-bold">Positions</h2>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => addSnackbar({ message: 'Top right', type: 'info', duration: 3000, position: 'top-right' })}>
              Top Right
            </Button>
            <Button variant="outline" onClick={() => addSnackbar({ message: 'Top center', type: 'info', duration: 3000, position: 'top-center' })}>
              Top Center
            </Button>
            <Button variant="outline" onClick={() => addSnackbar({ message: 'Bottom right', type: 'info', duration: 3000, position: 'bottom-right' })}>
              Bottom Right
            </Button>
            <Button variant="outline" onClick={() => addSnackbar({ message: 'Bottom center', type: 'info', duration: 3000, position: 'bottom-center' })}>
              Bottom Center
            </Button>
          </div>
        </div>

        {/* With action */}
        <div className="border border-line bg-surface p-card space-y-3 rounded-lg">
          <h2 className="text-lg font-bold">With Action</h2>
          <Button variant="outline" onClick={() => addSnackbar({
            message: (
              <span>
                Something happened.{' '}
                <button style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }} onClick={() => setOpenModal(true)}>
                  Open Modal
                </button>
              </span>
            ),
            type: 'info',
            duration: 5000,
          })}>
            Snackbar with Action
          </Button>
        </div>

      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)} maxWidth="400px" ariaLabel="Snackbar Modal">
        <h2>Modal from Snackbar</h2>
        <p>Opened via snackbar action link</p>
        <Button onClick={() => setOpenModal(false)}>Close</Button>
      </Modal>
    </div>
  );
};
