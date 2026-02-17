import { useState } from 'react';
import { useSnackbarContext } from '../../context/SnackbarContext';
import { Modal, ModalWrapper } from '../../components/Modal';
import { Button } from '../../components/Button';

export const ExampleModal = () => {
  const [openA, setOpenA] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [openB, setOpenB] = useState(false);
  const { addSnackbar } = useSnackbarContext();

  return (
    <div className="page-content">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setOpenA(true)}>Open A</Button>
        <Button variant="outline" onClick={() => setShowForm(true)}>Open C</Button>
      </div>

      <Modal open={openA} onClose={() => setOpenA(false)} maxWidth="400px" ariaLabel="Modal A">
        <h2>Modal A</h2>
        <p>First modal</p>
        <div className="flex gap-2">
          <Button onClick={() => setOpenB(true)}>Open B</Button>
          <Button onClick={() => setOpenA(false)}>Close A</Button>
        </div>
      </Modal>

      <Modal id="modal-b" open={openB} onClose={() => setOpenB(false)} maxWidth="300px" ariaLabel="Modal B">
        <h2>Modal B</h2>
        <p>Second modal on top</p>
        <Button onClick={() => setOpenB(false)}>Close B</Button>
      </Modal>

      <ModalWrapper
        id="form-modal"
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="User Form"
        footer={
          <div>
            <button onClick={() => setShowForm(false)}>Cancel</button>
            <button onClick={() => addSnackbar({
              message: 'Saved!',
              type: 'success',
              position: 'bottom-center',
            })}>Save</button>
          </div>
        }
      >
        Mock Form
      </ModalWrapper>
    </div>
  );
};
