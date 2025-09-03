import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExpandablePanel } from '../components/ExpandablePanel';
import { ExampleButtons } from './ExampleButtons';
import './example.css';

const App = () => {
  return (
    <div>
      <ExpandablePanel title="Buttons">
        <ExampleButtons />
      </ExpandablePanel>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}