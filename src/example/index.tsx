import { createRoot } from 'react-dom/client';
import { ExampleButtons } from './main-sections/ExampleButtons';
import { ExampleForm } from './main-sections/ExampleForm';
import { ExamplePopOver } from './main-sections/ExamplePopover';
import { ExampleTabs } from './main-sections/ExampleTabs';
import { ExampleTypography } from './main-sections/ExampleProse';
import { ExampleModal } from './main-sections/ExampleModal';
import { ExampleSnackbar } from './main-sections/ExampleSnackbar';
import { ExampleSkeleton } from './main-sections/ExampleSkeleton';
import { ExamplePagination } from './main-sections/ExamplePagination';
import { ExampleTooltip } from './main-sections/ExampleTooltip';
import { ExampleProgressBar } from './main-sections/ExampleProgressBar';
import { ModalProvider } from '../context/ModalContext';
import { SnackbarProvider, useSnackbarContext } from '../context/SnackbarContext';
import { Home, FileText, MousePointerClick, Image, Settings, HelpCircle, LogOut, SlidersHorizontal, ArrowLeftFromLine, ArrowRightFromLine, ChevronsUpDown, Upload, Layers, Box, ToggleLeft, Type, MessageSquare, Columns3, GalleryHorizontalEnd, Clock, Eye, BarChart3, CalendarDays, Table2 } from 'lucide-react';
import { SideMenu } from '../components/SideMenu';
import { SideMenuItems, type SideMenuItemData } from '../components/SideMenuItems';
import { PopOver } from '../components/PopOver';
import { MenuItem, MenuSeparator, SubMenu } from '../components/Menu';
import { Checkmark } from '../components/Checkmark';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { clsx } from 'clsx';
import './example.css';
import './styles/typography.css';
import './styles/layout.css';
import { ExampleFormModal } from './main-sections/ExampleFormModal';
import { CustomFormPage } from './pages/CustomFormPage';
import { ContextMenuPage } from './pages/ContextMenuPage';
import { CarouselPage } from './pages/CarouselPage';
import { SettingsModalPage } from './pages/SettingsModalPage';
import { FormSizesPage } from './pages/FormSizesPage';
import { ImageUploaderPage } from './pages/ImageUploaderPage';
import { SelectPage } from './pages/SelectPage';
import { DatePickerPage } from './pages/DatePickerPage';
import { TablePage } from './pages/TablePage';
import { ButtonGroupPage } from './pages/ButtonGroupPage';
import { BadgePage } from './pages/BadgePage';

// Theme hook
type Theme = 'light' | 'dark' | 'system';

function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored || 'system';
  });

  const applyTheme = useCallback((t: Theme) => {
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
    applyTheme(t);
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') applyTheme('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  return { theme, setTheme };
}

// User menu component (Claude Desktop style)
function UserMenu({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  const { addSnackbar } = useSnackbarContext();
  const { theme, setTheme } = useTheme();

  const handleAction = (action: string) => {
    addSnackbar({ message: action });
    setOpen(false);
  };

  const handleTheme = (t: Theme) => {
    setTheme(t);
    setOpen(false);
  };

  return (
    <PopOver
      isOpen={open}
      onClose={() => setOpen(false)}
      placement="top"
      align="center"
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
                <span className="text-sm font-medium">John Doe</span>
              </div>
              <ChevronsUpDown size={14} className="opacity-50 shrink-0" />
            </>
          )}
        </button>
      }
    >
      <div className="py-1 w-[calc(var(--spacing-side-menu)-1rem)]">
        <SubMenu icon={<Settings size={14} />} label="Settings">
          <MenuItem label="General" onClick={() => handleAction('Settings > General')} />
          <SubMenu label="Theme">
            <MenuItem
              rightIcon={theme === 'light' ? <Checkmark width={14} height={14} /> : undefined}
              label="Light"
              onClick={() => handleTheme('light')}
            />
            <MenuItem
              rightIcon={theme === 'dark' ? <Checkmark width={14} height={14} /> : undefined}
              label="Dark"
              onClick={() => handleTheme('dark')}
            />
            <MenuItem
              rightIcon={theme === 'system' ? <Checkmark width={14} height={14} /> : undefined}
              label="System"
              onClick={() => handleTheme('system')}
            />
          </SubMenu>
        </SubMenu>
        <MenuItem
          icon={<HelpCircle size={14} />}
          label="Help"
          onClick={() => handleAction('Help')}
        />
        <MenuSeparator />
        <MenuItem
          icon={<LogOut size={14} />}
          label="Sign out"
          onClick={() => handleAction('Sign out')}
          danger
        />
      </div>
    </PopOver>
  );
}

// Flat list of all menu items with paths for active key lookup
const menuItemsList = [
  { key: 'dashboard', path: '/' },
  { key: 'buttons', path: '/buttons' },
  { key: 'form', path: '/form' },
  { key: 'form-modal', path: '/form-modal' },
  { key: 'popover', path: '/popover' },
  { key: 'modal', path: '/modal' },
  { key: 'snackbar', path: '/snackbar' },
  { key: 'tabs', path: '/tabs' },
  { key: 'skeleton', path: '/skeleton' },
  { key: 'tooltip', path: '/tooltip' },
  { key: 'progress-bar', path: '/progress-bar' },
  { key: 'pagination', path: '/pagination' },
  { key: 'typography', path: '/typography' },
  { key: 'select', path: '/select' },
  { key: 'date-picker', path: '/date-picker' },
  { key: 'custom-form', path: '/custom-form' },
  { key: 'form-sizes', path: '/form-sizes' },
  { key: 'context-menu', path: '/context-menu' },
  { key: 'carousel', path: '/carousel' },
  { key: 'image-uploader', path: '/image-uploader' },
  { key: 'nav-modal', path: '/nav-modal' },
  { key: 'table', path: '/table' },
  { key: 'button-group', path: '/button-group' },
  { key: 'badge', path: '/badge' },
];

const SideNav = () => {

  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Derive active key from current path
  const activeKey = (() => {
    const path = location.pathname;
    const match = menuItemsList.find(i => i.path === path);
    return match?.key ?? 'dashboard';
  })();

  const menuItems: SideMenuItemData[] = [
    { key: 'dashboard', icon: <Home size="1rem"/>, label: "Dashboard", path: '/' },
    {
      key: 'components', icon: <Layers size="1rem"/>, label: "Components",
      children: [
        { key: 'buttons', icon: <Box size="1rem"/>, label: "Buttons", path: '/buttons' },
        { key: 'badge', icon: <Box size="1rem"/>, label: "Badge", path: '/badge' },
        { key: 'button-group', icon: <Box size="1rem"/>, label: "Button Group", path: '/button-group' },
        { key: 'form', icon: <FileText size="1rem"/>, label: "Form", path: '/form' },
        { key: 'form-modal', icon: <FileText size="1rem"/>, label: "Form Modal", path: '/form-modal' },
        { key: 'popover', icon: <MessageSquare size="1rem"/>, label: "PopOver", path: '/popover' },
        { key: 'modal', icon: <Columns3 size="1rem"/>, label: "Modal", path: '/modal' },
        { key: 'snackbar', icon: <MessageSquare size="1rem"/>, label: "Snackbar", path: '/snackbar' },
        { key: 'tabs', icon: <GalleryHorizontalEnd size="1rem"/>, label: "Tabs", path: '/tabs' },
        {
          key: 'feedback', icon: <Eye size="1rem"/>, label: "Feedback",
          children: [
            { key: 'skeleton', icon: <Clock size="1rem"/>, label: "Skeleton", path: '/skeleton' },
            { key: 'tooltip', icon: <MessageSquare size="1rem"/>, label: "Tooltip", path: '/tooltip' },
            { key: 'progress-bar', icon: <BarChart3 size="1rem"/>, label: "Progress Bar", path: '/progress-bar' },
          ],
        },
        { key: 'select', icon: <ChevronsUpDown size="1rem"/>, label: "Select", path: '/select' },
        { key: 'date-picker', icon: <CalendarDays size="1rem"/>, label: "Date Picker", path: '/date-picker' },
        { key: 'pagination', icon: <ToggleLeft size="1rem"/>, label: "Pagination", path: '/pagination' },
        { key: 'table', icon: <Table2 size="1rem"/>, label: "Table", path: '/table' },
        { key: 'typography', icon: <Type size="1rem"/>, label: "Typography", path: '/typography' },
      ],
    },
    { key: 'context-menu', icon: <MousePointerClick size="1rem"/>, label: "Context Menu", path: '/context-menu' },
    { key: 'carousel', icon: <Image size="1rem"/>, label: "Carousel", path: '/carousel' },
    { type: 'group', key: 'grp-examples', label: "Examples" },
    { key: 'custom-form', icon: <FileText size="1rem"/>, label: "Custom Form", path: '/custom-form' },
    { key: 'form-sizes', icon: <SlidersHorizontal size="1rem"/>, label: "Form Sizes", path: '/form-sizes' },
    { key: 'image-uploader', icon: <Upload size="1rem"/>, label: "Image Uploader", path: '/image-uploader' },
    { key: 'nav-modal', icon: <SlidersHorizontal size="1rem"/>, label: "Nav Modal", path: '/nav-modal' },
  ];

  const handleSelect = (key: string, path?: string) => {
    if (path) navigate(path);
  };

  const handleCloseMobile = () => {
    setMenuCollapsed(true);
  };

  return (
    <div className={clsx('h-dvh flex-shrink-0', menuCollapsed ? 'md:w-side-menu-min' : 'md:w-side-menu')}>
      <SideMenu
        isCollapsed={menuCollapsed}
        onToggleCollapse={(collapsed) => setMenuCollapsed(collapsed)}
        linkFn={(to) => navigate(to)}
        autoCloseMobileOnClick={false}
        className=""
        mobileToggleRenderer={(handleToggle) => (
          <button
            className="hover:bg-surface-hover w-8 h-8 shrink-0 cursor-pointer rounded-lg transition-all flex justify-center items-center"
            aria-label="Expand menu"
            onClick={() => handleToggle()}
          >
            <ArrowRightFromLine size={18} />
          </button>
        )}
        titleRenderer={(collapsed, handleToggle, mobile) => {
          // Capture mobile state from SideMenu's titleRenderer
          if (mobile !== isMobile) setTimeout(() => setIsMobile(mobile), 0);
          return (
            <div key="title" className="flex items-center pointer-events-auto w-side-menu p-2 transition-all" style={{ transform: collapsed && !mobile ? 'translateX(calc(-1 * var(--spacing-side-menu) + var(--spacing-side-menu-min)))' : 'translateX(0)' }}>
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
          );
        }}
        items={(
          <div className="flex flex-col w-full h-full min-h-0 pointer-events-auto">
            <div className="side-menu-content better-scroll">
                <SideMenuItems
                  items={menuItems}
                  activeItem={activeKey}
                  collapsed={menuCollapsed}
                  isMobile={isMobile}
                  onSelect={handleSelect}
                  onCloseMobile={handleCloseMobile}
                />
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
            <div className="w-full overflow-y-auto">
              <Routes>
                <Route path="/buttons" element={<ExampleButtons/>}/>
                <Route path="/form" element={<ExampleForm/>}/>
                <Route path="/form-modal" element={<ExampleFormModal/>}/>
                <Route path="/popover" element={<ExamplePopOver/>}/>
                <Route path="/modal" element={<ExampleModal/>}/>
                <Route path="/snackbar" element={<ExampleSnackbar/>}/>
                <Route path="/tabs" element={<ExampleTabs/>}/>
                <Route path="/skeleton" element={<ExampleSkeleton/>}/>
                <Route path="/tooltip" element={<ExampleTooltip/>}/>
                <Route path="/progress-bar" element={<ExampleProgressBar/>}/>
                <Route path="/pagination" element={<ExamplePagination/>}/>
                <Route path="/typography" element={<ExampleTypography/>}/>
                <Route path="/select" element={<SelectPage/>}/>
                <Route path="/date-picker" element={<DatePickerPage/>}/>
                <Route path="/custom-form" element={<CustomFormPage/>}/>
                <Route path="/form-sizes" element={<FormSizesPage/>}/>
                <Route path="/context-menu" element={<ContextMenuPage/>}/>
                <Route path="/carousel" element={<CarouselPage/>}/>
                <Route path="/image-uploader" element={<ImageUploaderPage/>}/>
                <Route path="/nav-modal" element={<SettingsModalPage/>}/>
                <Route path="/table" element={<TablePage/>}/>
                <Route path="/badge" element={<BadgePage/>}/>
                <Route path="/button-group" element={<ButtonGroupPage/>}/>
                <Route path="*" element={
                  <div className="page-content">
                    <h1 className="heading-1 mb-4">Dashboard</h1>
                    <p className="text-muted">Select a component from the sidebar to view its example.</p>
                  </div>
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