import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSnackbarContext } from '../../context/SnackbarContext';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { FormErrorMessage } from '../../components/FormErrorSignal';
import { Trash2 } from 'lucide-react';

type Item = { id: number; name: string };

const initialItems: Item[] = [
  { id: 1, name: 'Project Alpha' },
  { id: 2, name: 'Design Assets' },
  { id: 3, name: 'Old Reports' },
];

export const ExampleModal = () => {
  const [openA, setOpenA] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [openB, setOpenB] = useState(false);
  const [openLong, setOpenLong] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openInlineForm, setOpenInlineForm] = useState(false);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name: string; email: string }>({ mode: 'onTouched' });
  const { addSnackbar } = useSnackbarContext();

  return (
    <div className="page-content">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setOpenA(true)}>Stacked</Button>
        <Button variant="outline" onClick={() => setShowForm(true)}>With Footer</Button>
        <Button variant="outline" onClick={() => setOpenLong(true)}>Long Content</Button>
        <Button variant="outline" onClick={() => setOpenInlineForm(true)}>Form</Button>
        <Button variant="outline-danger" onClick={() => {
          setItemToDelete(null);
          setOpenConfirm(true);
        }}>Delete Item</Button>
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

      <Modal open={openLong} onClose={() => setOpenLong(false)} width="500px" ariaLabel="Long Content">
        <div className="modal-header">
          <h2 className="modal-title">Long Content</h2>
          <button type="button" className="modal-close-btn" onClick={() => setOpenLong(false)} aria-label="Close">×</button>
        </div>
        <div className="modal-content">
          {Array.from({ length: 30 }, (_, i) => (
            <p key={i} className="mb-3">Paragraph {i + 1} — Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          ))}
        </div>
        <div className="modal-footer">
          <Button variant="ghost" onClick={() => setOpenLong(false)}>Close</Button>
        </div>
      </Modal>

      <Modal open={openInlineForm} onClose={() => { setOpenInlineForm(false); reset(); }} width="400px" ariaLabel="Quick Form">
        <form onSubmit={handleSubmit((data) => {
          addSnackbar({ message: `Submitted: ${data.name} (${data.email})`, type: 'success', position: 'bottom-center' });
          reset();
          setOpenInlineForm(false);
        })}>
          <div className="modal-header">
            <h2 className="modal-title">Quick Form</h2>
            <button type="button" className="modal-close-btn" onClick={() => { setOpenInlineForm(false); reset(); }} aria-label="Close">×</button>
          </div>
          <div className="modal-content grid gap-5 pb-7">
            <div className="flex flex-col">
              <label className="form-label">Name</label>
              <input className={`form-control ${errors.name ? 'form-field-error' : ''}`} placeholder="John Doe" {...register('name', { required: 'Name is required' })} />
              <FormErrorMessage error={errors.name} />
            </div>
            <div className="flex flex-col">
              <label className="form-label">Email</label>
              <input className={`form-control ${errors.email ? 'form-field-error' : ''}`} type="email" placeholder="john@example.com" {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' }
              })} />
              <FormErrorMessage error={errors.email} />
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="ghost" type="button" onClick={() => { setOpenInlineForm(false); reset(); }}>Cancel</Button>
            <Button variant="primary" type="submit">Submit</Button>
          </div>
        </form>
      </Modal>

      {items.length > 0 && (
        <div className="card mt-5" style={{ maxWidth: 360 }}>
          <h3 className="heading-3 mb-3">Items</h3>
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between py-1">
                <span>{item.name}</span>
                <button
                  type="button"
                  className="text-danger hover:text-danger-hover cursor-pointer"
                  onClick={() => {
                    setItemToDelete(item);
                    setOpenConfirm(true);
                  }}
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="400px" ariaLabel="Confirm Delete">
        <div className="modal-header">
          <h2 className="modal-title">Delete Item</h2>
          <button type="button" className="modal-close-btn" onClick={() => setOpenConfirm(false)} aria-label="Close">×</button>
        </div>
        <div className="modal-content">
          <p>Are you sure you want to delete {itemToDelete ? <strong>{itemToDelete.name}</strong> : 'this item'}? This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <Button variant="ghost" onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => {
            if (itemToDelete) {
              setItems(prev => prev.filter(i => i.id !== itemToDelete.id));
            }
            addSnackbar({ message: `${itemToDelete?.name ?? 'Item'} deleted`, type: 'error', position: 'bottom-center' });
            setOpenConfirm(false);
            setItemToDelete(null);
          }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};
