import React, { useState } from 'react';
import { useSnackbarContext } from '../../context/SnackbarContext'; // Import the useSnackbar hook
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';

export const ExampleModal: React.FC = () => {
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);
  const { addSnackbar } = useSnackbarContext();

  const getRandomWord = () => {
    const list = ['Apple', 'Banana', 'Orange', 'Grape', 'Peach'];
    return list[Math.floor(Math.random() * list.length)] + list[Math.floor(Math.random() * list.length)];
  };

  const getRandomSnackbarType = () => {
    const list = ['success', 'error', 'warning', 'info'];
    return list[Math.floor(Math.random() * list.length)] as any;
  };

  const handleOpenA = () => {
    setOpenA(true);
  };

  const handleCloseA = () => {
    setOpenA(false);
  };

  const handleOpenB = () => {
    setOpenB(true);
  };

  const handleCloseB = () => {
    setOpenB(false);
  };

  return (
    <div className="page-content">
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleOpenA}>Open A</Button>
        <Button onClick={() => addSnackbar({
          message: getRandomWord(),
          type: getRandomSnackbarType(),
          duration: 5000,
          position: 'top-right',
        })}>
          Show Snackbar Top Right
        </Button>
        <Button onClick={() => addSnackbar({
          message: getRandomWord(),
          type: getRandomSnackbarType(),
          duration: 5000,
          position: 'bottom-right',
        })}>
          Show Snackbar Bottom Right
        </Button>
        <Button onClick={() => addSnackbar({
          message: getRandomWord(),
          type: getRandomSnackbarType(),
          position: 'bottom-center',
        })}>
          Show Snackbar Bottom Center
        </Button>
      </div>

      <Modal id="modal-a" open={openA} onClose={handleCloseA} ariaLabel="Modal A">
        <h2>Modal A</h2>
        <p>First modal</p>
        <div className="flex gap-2">
          <Button onClick={handleOpenB}>Open B</Button>
          <Button onClick={handleCloseA}>Close A</Button>
        </div>
      </Modal>

      <Modal id="modal-b" open={openB} onClose={handleCloseB} ariaLabel="Modal B">
        <h2>Modal B</h2>
        <p>Second modal on top</p>
        <Button onClick={handleCloseB}>Close B</Button>
      </Modal>
    </div>
  );
};