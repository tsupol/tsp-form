import { useState, useEffect } from 'react';
import { useSnackbarContext } from '../../context/SnackbarContext';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';

export const ExampleModal = () => {
  const [openA, setOpenA] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [openB, setOpenB] = useState(false);

  useEffect(() => { console.log('openA:', openA); }, [openA]);
  useEffect(() => { console.log('openB:', openB); }, [openB]);
  useEffect(() => { console.log('showForm:', showForm); }, [showForm]);
  const { addSnackbar } = useSnackbarContext();

  return (
    <div className="page-content">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setOpenA(true)}>Open A</Button>
        <Button variant="outline" onClick={() => setShowForm(true)}>Open C</Button>
      </div>

      <Modal open={openA} onClose={() => setOpenA(false)} maxWidth="400px" ariaLabel="Modal A">
        <div className="modal-header">
          <h2 className="modal-title">Modal A</h2>
          <button type="button" className="modal-close-btn" onClick={() => setOpenA(false)} aria-label="Close">×</button>
        </div>
        <div className="modal-content">
          <p>First modal</p>
        </div>
        <div className="modal-footer">
          <Button onClick={() => setOpenB(true)}>Open B</Button>
          <Button variant="ghost" onClick={() => setOpenA(false)}>Close A</Button>
        </div>
      </Modal>

      <Modal id="modal-b" open={openB} onClose={() => setOpenB(false)} maxWidth="300px" ariaLabel="Modal B">
        <div className="modal-header">
          <h2 className="modal-title">Modal B</h2>
          <button type="button" className="modal-close-btn" onClick={() => setOpenB(false)} aria-label="Close">×</button>
        </div>
        <div className="modal-content">
          <p>Second modal on top</p>
        </div>
        <div className="modal-footer">
          <Button onClick={() => setOpenB(false)}>Close B</Button>
        </div>
      </Modal>

      <Modal
        id="form-modal"
        open={showForm}
        onClose={() => setShowForm(false)}
        width="500px"
        ariaLabel="User Form"
      >
        <div className="modal-header">
          <h2 className="modal-title">User Form</h2>
          <button type="button" className="modal-close-btn" onClick={() => setShowForm(false)} aria-label="Close">×</button>
        </div>
        <div className="modal-content">
          Mock Form
        </div>
        <div className="modal-footer">
          <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => addSnackbar({
            message: 'Saved!',
            type: 'success',
            position: 'bottom-center',
          })}>Save</Button>
        </div>
      </Modal>
    </div>
  );
};
