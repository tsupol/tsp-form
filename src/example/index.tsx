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
import { SnackbarProvider, useSnackbarContext } from '../context/SnackbarContext';
import { Home, FileText, MousePointerClick, Image, Settings, HelpCircle, LogOut, ChevronRight, SlidersHorizontal, ArrowLeftFromLine, ArrowRightFromLine, ChevronsUpDown, Upload } from 'lucide-react';
import { SideMenu } from '../components/SideMenu';
import { PopOver } from '../components/PopOver';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import { useState, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { clsx } from 'clsx';
import './example.css';
import { ExampleFormModal } from './main-sections/ExampleFormModal';
import { CustomFormPage } from './pages/CustomFormPage';
import { ContextMenuPage } from './pages/ContextMenuPage';
import { CarouselPage } from './pages/CarouselPage';
import { SettingsModalPage } from './pages/SettingsModalPage';
import { FormSizesPage } from './pages/FormSizesPage';
import { ImageUploaderPage } from './pages/ImageUploaderPage';

// Menu item component for user menu
function UserMenuItem({ icon, label, onClick, shortcut, danger }: {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  shortcut?: string;
  danger?: boolean;
}) {
  return (
    <button
      className={clsx(
        'w-full text-left px-3 py-1.5 text-sm hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-2',
        danger ? 'text-danger' : ''
      )}
      onClick={onClick}
    >
      {icon && <span className="w-4 h-4 flex items-center justify-center opacity-70">{icon}</span>}
      <span className="flex-1">{label}</span>
      {shortcut && <span className="text-xs opacity-50">{shortcut}</span>}
    </button>
  );
}

// Submenu component with hover
function UserSubMenu({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  return (
    <PopOver
      isOpen={open}
      onClose={() => setOpen(false)}
      placement="right"
      align="start"
      offset={0}
      openDelay={0}
      trigger={
        <button
          className="w-full text-left px-3 py-1.5 text-sm hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-2"
          onMouseEnter={() => { cancelClose(); setOpen(true); }}
          onMouseLeave={() => scheduleClose()}
        >
          {icon && <span className="w-4 h-4 flex items-center justify-center opacity-70">{icon}</span>}
          <span className="flex-1">{label}</span>
          <ChevronRight size={14} className="opacity-50" />
        </button>
      }
    >
      <div
        className="py-1 min-w-[180px]"
        onMouseEnter={() => cancelClose()}
        onMouseLeave={() => scheduleClose()}
      >
        {children}
      </div>
    </PopOver>
  );
}

// User menu component (Claude Desktop style)
function UserMenu({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const { addSnackbar } = useSnackbarContext();

  const handleAction = (action: string) => {
    addSnackbar({ message: action });
    setOpen(false);
  };

  return (
    <PopOver
      isOpen={open}
      onClose={() => setOpen(false)}
      placement="top"
      align="start"
      offset={4}
      openDelay={0}
      triggerClassName="w-full"
      trigger={
        <button
          className="flex items-center gap-2 py-2 px-2 rounded-lg transition-all text-item-fg hover:bg-item-hover-bg w-full cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <div className="w-7.5 h-7.5 rounded-full bg-primary flex items-center justify-center text-primary-contrast text-xs font-semibold shrink-0">
            JD
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left truncate">
                <span className="text-sm">John Doe</span>
              </div>
              <ChevronsUpDown size={14} className="opacity-50 shrink-0" />
            </>
          )}
        </button>
      }
    >
      <div className="py-1 w-[260px]">
        <UserSubMenu icon={<Settings size={14} />} label="Settings">
          <UserMenuItem label="General" onClick={() => handleAction('Settings > General')} />
          <UserSubMenu label="Theme">
            <UserMenuItem label="Light" onClick={() => handleAction('Theme > Light')} />
            <UserMenuItem label="Dark" onClick={() => handleAction('Theme > Dark')} />
          </UserSubMenu>
        </UserSubMenu>
        <UserMenuItem
          icon={<HelpCircle size={14} />}
          label="Help"
          onClick={() => handleAction('Help')}
        />
        <hr className="border-line my-1" />
        <UserMenuItem
          icon={<LogOut size={14} />}
          label="Sign out"
          onClick={() => handleAction('Sign out')}
          danger
        />
      </div>
    </PopOver>
  );
}

const SideNav = () => {

  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const navigate = useNavigate();
  const customMenuItems = [
    { icon: <Home size="1rem"/>, label: "Dashboard", to: '/dashboard' },
    { icon: <FileText size="1rem"/>, label: "Documents", to: '/docs' },
    { icon: <FileText size="1rem"/>, label: "Custom Form", to: '/custom-form' },
    { icon: <SlidersHorizontal size="1rem"/>, label: "Form Sizes", to: '/form-sizes' },
    { icon: <MousePointerClick size="1rem"/>, label: "Context Menu", to: '/context-menu' },
    { icon: <Image size="1rem"/>, label: "Carousel", to: '/carousel' },
    { icon: <Upload size="1rem"/>, label: "Image Uploader", to: '/image-uploader' },
    { icon: <SlidersHorizontal size="1rem"/>, label: "Nav Modal", to: '/nav-modal' },
  ];
  return (
    <div className={clsx('h-dvh flex-shrink-0', menuCollapsed ? 'md:w-side-menu-min' : 'md:w-side-menu')}>
      <SideMenu
        isCollapsed={false}
        onToggleCollapse={(collapsed) => setMenuCollapsed(collapsed)}
        linkFn={(to) => navigate(to)}
        className="bg-surface-shallow border-r border-line"
        mobileToggleRenderer={(handleToggle) => (
          <button
            className="hover:bg-surface-hover w-8 h-8 shrink-0 cursor-pointer rounded-lg transition-all flex justify-center items-center"
            aria-label="Expand menu"
            onClick={() => handleToggle()}
          >
            <ArrowRightFromLine size={18} />
          </button>
        )}
        titleRenderer={(collapsed, handleToggle, isMobile) => (
          <div key="title" className="flex items-center pointer-events-auto w-side-menu p-2 transition-all" style={{ transform: collapsed && !isMobile ? 'translateX(calc(-1 * var(--spacing-side-menu) + var(--spacing-side-menu-min)))' : 'translateX(0)' }}>
            <div className="flex items-center flex-1 cursor-pointer pl-2"
                 style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.3s ease' }}
                 onClick={() => handleToggle()}>
              <span className="font-semibold">TSP Form</span>
            </div>
            <button
              className="hover:bg-surface w-8 h-8 shrink-0 cursor-pointer rounded-lg transition-all flex justify-center items-center"
              aria-label={collapsed ? "Expand menu" : "Collapse menu"}
              onClick={() => handleToggle()}
            >
              {collapsed ? <ArrowRightFromLine size={18} /> : <ArrowLeftFromLine size={18} />}
            </button>
          </div>
        )}
        items={(
          <div className="flex flex-col w-full h-full min-h-0 pointer-events-auto">
            <div className="side-menu-content better-scroll">
              <div className={clsx('p-2 flex flex-col w-side-menu', menuCollapsed ? 'items-start' : '')}>
                {customMenuItems.map((item, index) => {
                  return (
                    <Link key={index} className="flex py-1 rounded-lg transition-all text-item-fg hover:bg-item-hover-bg gap-2" to={item.to}>
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
            <div className={clsx('border-t border-line py-2 pointer-events-auto', menuCollapsed ? 'px-0' : 'px-2')}>
              <UserMenu collapsed={menuCollapsed} />
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
            <div className="p-4 w-full">
              <Routes>
                <Route path="/custom-form" element={<CustomFormPage/>}/>
                <Route path="/form-sizes" element={<FormSizesPage/>}/>
                <Route path="/context-menu" element={<ContextMenuPage/>}/>
                <Route path="/carousel" element={<CarouselPage/>}/>
                <Route path="/image-uploader" element={<ImageUploaderPage/>}/>
                <Route path="/nav-modal" element={<SettingsModalPage/>}/>
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