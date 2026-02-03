import { createRoot } from 'react-dom/client';
import { CollapsiblePanel } from '../components/CollapsiblePanel';
import { ExampleButtons } from './main-sections/ExampleButtons';
import { ExampleForm } from './main-sections/ExampleForm';
import { ExamplePopOver } from './main-sections/ExamplePopover';
import { ExampleTabs } from './main-sections/ExampleTabs';
import { ExampleProse } from './main-sections/ExampleProse';
import { ExampleModal } from './main-sections/ExampleModal';
import { ExampleSkeleton } from './main-sections/ExampleSkeleton';
import { ExamplePagination } from './main-sections/ExamplePagination';
import { ExampleTooltip } from './main-sections/ExampleTooltip';
import { ExampleProgressBar } from './main-sections/ExampleProgressBar';
import { ModalProvider } from '../context/ModalContext';
import { SnackbarProvider } from '../context/SnackbarContext';
import { Home, FileText, MousePointerClick } from 'lucide-react';
import { SideMenu } from '../components/SideMenu';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { clsx } from 'clsx';
import './example.css';
import { ExampleFormModal } from './main-sections/ExampleFormModal';
import { CustomFormPage } from './pages/CustomFormPage';
import { ContextMenuPage } from './pages/ContextMenuPage';

const SideNav = () => {

  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const navigate = useNavigate();
  const customMenuItems = [
    { icon: <Home size="1rem"/>, label: "Dashboard", to: '/dashboard' },
    { icon: <FileText size="1rem"/>, label: "Documents", to: '/docs' },
    { icon: <FileText size="1rem"/>, label: "Custom Form", to: '/custom-form' },
    { icon: <MousePointerClick size="1rem"/>, label: "Context Menu", to: '/context-menu' },
  ];
  return (
    <div className={clsx('h-screen flex-shrink-0', menuCollapsed ? 'md:w-side-menu-min' : 'md:w-side-menu')}>
      <SideMenu
        isCollapsed={false}
        onToggleCollapse={(collapsed) => setMenuCollapsed(collapsed)}
        linkFn={(to) => navigate(to)}
        className="bg-surface-shallow border-r border-line"
        titleRenderer={(collapsed, handleToggle) => (
          <div className="flex pointer-events-auto relative w-side-menu p-2" onClick={() => handleToggle()}>
            <button
              className="bg-primary text-primary-contrast w-8 h-8 shrink-0 cursor-pointer rounded-lg"
              aria-label={collapsed ? "Expand menu" : "Collapse menu"}
            >
              {collapsed ? '>' : '<'}
            </button>
            <div className="flex justify-center items-center w-full cursor-pointer"
                 style={{ visibility: collapsed ? 'hidden' : 'visible' }}>TSP Form
            </div>
          </div>
        )}
        items={(
          <div className="flex flex-col w-full h-full min-h-0">
            <div className="side-menu-content better-scroll">
              <div className={clsx('p-2 flex flex-col w-side-menu', menuCollapsed ? 'items-start' : '')}>
                {customMenuItems.map((item, index) => {
                  return (
                    <Link key={index} className="flex py-1 rounded-lg transition-all text-item-fg hover:bg-item-hover-bg" to={item.to}>
                      <div className="flex justify-center items-center w-8 h-8">
                        {item.icon}
                      </div>
                      {!menuCollapsed && (
                        <div className="flex items-center">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="h-10 w-full border-t border-line flex justify-center items-center p-4">
              {menuCollapsed ? 'U' : 'User'}
            </div>
          </div>
        )}
      />
    </div>
  );
};

const App = () => {

  return (
    <ModalProvider>
      <SnackbarProvider>
        <BrowserRouter>
          <div className="flex">
            <SideNav/>
            <div className="p-4">
              <Routes>
                <Route path="/custom-form" element={<CustomFormPage/>}/>
                <Route path="/context-menu" element={<ContextMenuPage/>}/>
                <Route path="*" element={
                  <>
                    <h1 className="">Components</h1>
                    <div className="grid gap-4">
                      <CollapsiblePanel title="Modal">
                        <ExampleFormModal/>
                      </CollapsiblePanel>
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
                      <CollapsiblePanel title="Skeleton">
                        <ExampleSkeleton/>
                      </CollapsiblePanel>
                      <CollapsiblePanel title="Pagination">
                        <ExamplePagination/>
                      </CollapsiblePanel>
                      <CollapsiblePanel title="Tooltip">
                        <ExampleTooltip/>
                      </CollapsiblePanel>
                      <CollapsiblePanel title="Progress Bar">
                        <ExampleProgressBar/>
                      </CollapsiblePanel>
                      <CollapsiblePanel title="Prose">
                        <ExampleProse/>
                      </CollapsiblePanel>
                    </div>
                  </>
                }/>
              </Routes>
            </div>
          </div>
        </BrowserRouter>
      </SnackbarProvider>
    </ModalProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App/>);
}