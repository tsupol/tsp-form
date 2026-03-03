import { useState } from 'react';
import { Drawer } from '../../components/Drawer';
import { Button } from '../../components/Button';

type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

export const DrawerPage = () => {
  const [openSide, setOpenSide] = useState<DrawerSide | null>(null);
  const [wideOpen, setWideOpen] = useState(false);
  const [tallOpen, setTallOpen] = useState(false);

  return (
    <div className="page-content">
      <h1 className="heading-1 mb-1">Drawer</h1>
      <p className="text-muted mb-6">Side panel that slides in from any edge. Uses ModalContext for backdrop, stacking, scroll lock, and escape key.</p>

      <h3 className="heading-3 mb-3">All Sides</h3>
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setOpenSide('left')}>Open Left</Button>
          <Button onClick={() => setOpenSide('right')}>Open Right</Button>
          <Button onClick={() => setOpenSide('top')}>Open Top</Button>
          <Button onClick={() => setOpenSide('bottom')}>Open Bottom</Button>
        </div>
      </div>

      {(['left', 'right', 'top', 'bottom'] as DrawerSide[]).map((side) => (
        <Drawer
          key={side}
          open={openSide === side}
          onClose={() => setOpenSide(null)}
          side={side}
          ariaLabel={`${side} drawer`}
        >
          <div className="drawer-header">
            <h2 className="drawer-title">{side.charAt(0).toUpperCase() + side.slice(1)} Drawer</h2>
            <button className="drawer-close-btn" onClick={() => setOpenSide(null)}>&times;</button>
          </div>
          <div className="drawer-content">
            <p className="text-muted mb-4">This drawer slides in from the <strong>{side}</strong>.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          </div>
          <div className="drawer-footer">
            <Button variant="ghost" onClick={() => setOpenSide(null)}>Cancel</Button>
            <Button onClick={() => setOpenSide(null)}>Save</Button>
          </div>
        </Drawer>
      ))}

      <h3 className="heading-3 mb-3">Custom Width</h3>
      <div className="card mb-6">
        <Button onClick={() => setWideOpen(true)}>Open Wide Drawer (40rem)</Button>
      </div>

      <Drawer
        open={wideOpen}
        onClose={() => setWideOpen(false)}
        side="right"
        width="40rem"
        ariaLabel="Wide drawer"
      >
        <div className="drawer-header">
          <h2 className="drawer-title">Wide Drawer</h2>
          <button className="drawer-close-btn" onClick={() => setWideOpen(false)}>&times;</button>
        </div>
        <div className="drawer-content">
          <p className="text-muted mb-4">This drawer has a custom width of 40rem.</p>
          <p>Use the <code>width</code> prop on left/right drawers to customize the panel width.</p>
        </div>
      </Drawer>

      <h3 className="heading-3 mb-3">Custom Height</h3>
      <div className="card">
        <Button onClick={() => setTallOpen(true)}>Open Tall Bottom Drawer (60dvh)</Button>
      </div>

      <Drawer
        open={tallOpen}
        onClose={() => setTallOpen(false)}
        side="bottom"
        height="60dvh"
        ariaLabel="Tall bottom drawer"
      >
        <div className="drawer-header">
          <h2 className="drawer-title">Tall Bottom Drawer</h2>
          <button className="drawer-close-btn" onClick={() => setTallOpen(false)}>&times;</button>
        </div>
        <div className="drawer-content">
          <p className="text-muted mb-4">This bottom drawer has a custom height of 60dvh.</p>
          <p>Use the <code>height</code> prop on top/bottom drawers to customize the panel height.</p>
        </div>
      </Drawer>
    </div>
  );
};
