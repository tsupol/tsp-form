import React from 'react';
import { createRoot } from 'react-dom/client';
import { CollapsiblePanel } from '../components/CollapsiblePanel';
import { ExampleButtons } from './pages/ExampleButtons';
import { ExampleForm } from './pages/ExampleForm';
import { ExamplePopOver } from './pages/ExamplePopover';
import { ExampleTabs } from './pages/ExampleTabs';
import { ExampleProse } from './pages/ExampleProse';
import { ExampleModal } from './pages/ExampleModal';
import { ModalProvider } from '../context/ModalContext';
import { SnackbarProvider } from '../context/SnackbarContext';
import './styles/utils.css';
import './example.css';

const App = () => {
  return (
    <ModalProvider>
      <SnackbarProvider>
        <div>
          <h1 className="mb-6">Components</h1>
          <div className="grid gap-4">
            <CollapsiblePanel title="Modal">
              <ExampleModal/>
            </CollapsiblePanel>
            <CollapsiblePanel title="Form">
              <ExampleForm/>
            </CollapsiblePanel>
            <CollapsiblePanel title="PopOver">
              <ExamplePopOver/>
            </CollapsiblePanel>
            <CollapsiblePanel title="Responsive Tabs">
              <ExampleTabs/>
            </CollapsiblePanel>
            <CollapsiblePanel title="Buttons">
              <ExampleButtons/>
            </CollapsiblePanel>
            <CollapsiblePanel title="Prose">
              <ExampleProse/>
            </CollapsiblePanel>
          </div>
        </div>
      </SnackbarProvider>
    </ModalProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App/>);
}