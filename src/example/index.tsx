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
import { Home, Settings, HelpCircle, LogOut, SlidersHorizontal, ArrowLeftFromLine, ArrowRightFromLine, ChevronsUpDown, Layers, Box, Type, Columns3, Table2, Bell, FolderTree, ClipboardList, Users } from 'lucide-react';
import { Badge } from '../components/Badge';
import { SideMenu } from '../components/SideMenu';
import { SideMenuItems, type SideMenuItemData } from '../components/SideMenuItems';
import { PopOver } from '../components/PopOver';
import { MenuItem, MenuSeparator, SubMenu } from '../components/Menu';
import { Checkmark } from '../components/Checkmark';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { clsx } from 'clsx';
import './i18n/config';
import { useTranslation } from 'react-i18next';
import './example.css';
import './styles/typography.css';
import './styles/layout.css';

import { ContextMenuPage } from './pages/ContextMenuPage';
import { CarouselPage } from './pages/CarouselPage';
import { SettingsModalPage } from './pages/SettingsModalPage';
import { FormSizesPage } from './pages/FormSizesPage';
import { ImageUploaderPage } from './pages/ImageUploaderPage';
import { ImageZoomPanPage } from './pages/ImageZoomPanPage';
import { SelectPage } from './pages/SelectPage';
import { DatePickerPage } from './pages/DatePickerPage';
import { TablePage } from './pages/TablePage';
import { ButtonGroupPage } from './pages/ButtonGroupPage';
import { BadgePage } from './pages/BadgePage';
import { ServerPaginationPage } from './pages/ServerPaginationPage';
import { AlertPage } from './pages/AlertPage';
import { FontComparePage } from './pages/FontComparePage';
import { TextShiftPage } from './pages/TextShiftPage';
import { DrawerPage } from './pages/DrawerPage';
import { PageNavPage } from './pages/PageNavPage';
import { PageNavTablePage } from './pages/PageNavTablePage';
import { FileUploaderPage } from './pages/FileUploaderPage';
import { NumberSpinnerPage } from './pages/NumberSpinnerPage';
import { SwitchPage } from './pages/SwitchPage';
import { CheckboxPage } from './pages/CheckboxPage';
import { MaskedInputPage } from './pages/MaskedInputPage';
import { InputPage } from './pages/InputPage';

import { DebugPage } from './pages/DebugPage';
import { DisabledStatePage } from './pages/DisabledStatePage';
import { MobileHeaderPage, ArticleDetailPage } from './pages/MobileHeaderPage';
import { ComponentsLayout } from './pages/ComponentsPage';
import { PurchaseOrdersExample } from './pages/page-examples/PurchaseOrdersExample';
import { AssetsExample } from './pages/page-examples/AssetsExample';
import { UsersExample } from './pages/page-examples/UsersExample';
import { PageExamplesLayout } from './pages/page-examples/PageExamplesLayout';

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
  const { i18n } = useTranslation();

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
          className={clsx('flex items-center gap-3 py-2.5 transition-all text-item-fg hover:bg-item-hover-bg w-full cursor-pointer', collapsed ? 'px-1.5' : 'px-3')}
          onClick={() => setOpen(!open)}
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-contrast text-sm font-semibold shrink-0">
            JD
          </div>
          <div className="flex-1 text-left truncate">
            <div className="text-sm font-medium leading-tight">John Doe</div>
            <div className="text-xs text-subtle leading-tight">Administrator</div>
          </div>
          <ChevronsUpDown size={14} className="opacity-50 shrink-0" />
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
          <SubMenu label="Language">
            <MenuItem
              rightIcon={i18n.language === 'en' ? <Checkmark width={14} height={14} /> : undefined}
              label="English"
              onClick={() => { i18n.changeLanguage('en'); setOpen(false); }}
            />
            <MenuItem
              rightIcon={i18n.language === 'th' ? <Checkmark width={14} height={14} /> : undefined}
              label="ไทย"
              onClick={() => { i18n.changeLanguage('th'); setOpen(false); }}
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

const mockNotifications = [
  { id: 1, text: 'New component published: ImageCropper', time: '2 min ago' },
  { id: 2, text: 'Build succeeded on main branch', time: '15 min ago' },
  { id: 3, text: 'PR #42 merged: Add DateRangePicker', time: '1 hour ago' },
  { id: 4, text: 'Issue #38 assigned to you', time: '3 hours ago' },
];

function NotificationMenuItem({ collapsed, isMobile }: { collapsed: boolean; isMobile: boolean }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const dot = <span className="block w-1.5 h-1.5 rounded-full bg-primary" />;
  const countBadge = <Badge color="primary" size="xs">{mockNotifications.length}</Badge>;

  return (
    <>
      <button
        ref={triggerRef}
        className="side-menu-item"
        onClick={() => setOpen(!open)}
      >
        <span className="side-menu-item-icon relative">
          <Bell size="1rem" />
          {collapsed && <span className="absolute -top-0 -right-0.5">{dot}</span>}
        </span>
        {!collapsed && <span className="side-menu-item-label">Notifications</span>}
        {!collapsed && countBadge}
      </button>
      <PopOver
        isOpen={open}
        onClose={() => setOpen(false)}
        triggerRef={triggerRef}
        placement="right"
        align="start"
        offset={4}
        minWidth="260px"
        maxWidth="320px"
      >
        <div className="flex flex-col py-1">
          <div className="px-3 py-2 text-xs font-semibold text-subtle uppercase tracking-wide">Notifications</div>
          {mockNotifications.map((n) => (
            <div key={n.id} className="px-3 py-2 hover:bg-item-hover-bg cursor-pointer transition-colors rounded">
              <div className="text-sm">{n.text}</div>
              <div className="text-xs text-subtle mt-0.5">{n.time}</div>
            </div>
          ))}
        </div>
      </PopOver>
    </>
  );
}

const SideNav = () => {

  const [menuCollapsed, setMenuCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: SideMenuItemData[] = [
    { key: 'dashboard', icon: <Home size="1rem"/>, label: "Dashboard", path: '/' },
    { key: 'components', icon: <Layers size="1rem"/>, label: "Components", path: '/components', children: [
      { key: 'comp-alert', label: "Alert", path: '/components/alert' },
      { key: 'comp-badge', label: "Badge", path: '/components/badge' },
      { key: 'comp-button-group', label: "Button Group", path: '/components/button-group' },
      { key: 'comp-buttons', label: "Buttons", path: '/components/buttons' },
      { key: 'comp-carousel', label: "Carousel", path: '/components/carousel' },
      { key: 'comp-checkbox', label: "Checkbox", path: '/components/checkbox' },
      { key: 'comp-context-menu', label: "Context Menu", path: '/components/context-menu' },
      { key: 'comp-date-picker', label: "Date Picker", path: '/components/date-picker' },
      { key: 'comp-drawer', label: "Drawer", path: '/components/drawer' },
      { key: 'comp-file-uploader', label: "File Uploader", path: '/components/file-uploader' },
      { key: 'comp-form', label: "Form", path: '/components/form' },
      { key: 'comp-image-uploader', label: "Image Uploader", path: '/components/image-uploader' },
      { key: 'comp-image-zoom-pan', label: "Image Zoom & Pan", path: '/components/image-zoom-pan' },
      { key: 'comp-input', label: "Input", path: '/components/input' },
      { key: 'comp-masked-input', label: "Masked Input", path: '/components/masked-input' },
      { key: 'comp-modal', label: "Modal", path: '/components/modal' },
      { key: 'comp-number-spinner', label: "Number Spinner", path: '/components/number-spinner' },
      { key: 'comp-pagination', label: "Pagination", path: '/components/pagination' },
      { key: 'comp-popover', label: "PopOver", path: '/components/popover' },
      { key: 'comp-progress-bar', label: "Progress Bar", path: '/components/progress-bar' },
      { key: 'comp-select', label: "Select", path: '/components/select' },
      { key: 'comp-skeleton', label: "Skeleton", path: '/components/skeleton' },
      { key: 'comp-snackbar', label: "Snackbar", path: '/components/snackbar' },
      { key: 'comp-switch', label: "Switch", path: '/components/switch' },
      { key: 'comp-table', label: "Table", path: '/components/table' },
      { key: 'comp-tabs', label: "Tabs", path: '/components/tabs' },
      { key: 'comp-tooltip', label: "Tooltip", path: '/components/tooltip' },
      { key: 'comp-typography', label: "Typography", path: '/components/typography' },
    ]},
    { type: 'group', key: 'grp-examples', label: "Examples" },
    { key: 'form-sizes', icon: <SlidersHorizontal size="1rem"/>, label: "Form Sizes", path: '/form-sizes' },
    { key: 'nav-modal', icon: <SlidersHorizontal size="1rem"/>, label: "Nav Modal", path: '/nav-modal' },
    { key: 'server-pagination', icon: <Table2 size="1rem"/>, label: "Server Pagination", path: '/server-pagination' },
    { key: 'font-compare', icon: <Type size="1rem"/>, label: "Font Compare", path: '/font-compare' },
    { key: 'text-shift', icon: <SlidersHorizontal size="1rem"/>, label: "Text Shift", path: '/text-shift' },
    { key: 'page-nav', icon: <Columns3 size="1rem"/>, label: "PageNav", path: '/page-nav' },
    { key: 'page-nav-table', icon: <Table2 size="1rem"/>, label: "PageNav Table", path: '/page-nav-table' },
    { key: 'mobile-header', icon: <Box size="1rem"/>, label: "Mobile Header", path: '/mobile-header' },
    { key: 'page-examples', icon: <FolderTree size="1rem"/>, label: "Page Examples", path: '/page-examples', children: [
      { type: 'group', key: 'grp-pe-pagenav', label: "PageNav patterns" },
      { key: 'pe-list-detail', icon: <ClipboardList size="1rem"/>, label: "List + Detail", path: '/page-examples/list-detail' },
      { key: 'pe-list-detail-filters', icon: <Box size="1rem"/>, label: "List + Detail w/ Filters", path: '/page-examples/list-detail-filters' },
      { type: 'group', key: 'grp-pe-admin', label: "Admin" },
      { key: 'pe-users', icon: <Users size="1rem"/>, label: "Users", path: '/page-examples/users' },
    ]},
    { type: 'custom', key: 'notifications', render: (props) => <NotificationMenuItem {...props} /> },
    { type: 'group', key: 'grp-debug', label: "Debug" },
    { key: 'debug', icon: <Settings size="1rem"/>, label: "Debug", path: '/debug' },
    { key: 'disabled-state', icon: <Settings size="1rem"/>, label: "Disabled State", path: '/debug/disabled-state' },
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
        onToggleCollapse={(collapsed) => { setMenuCollapsed(collapsed); localStorage.setItem('sidebar-collapsed', String(collapsed)); }}
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
                  activePath={location.pathname}
                  collapsed={menuCollapsed}
                  isMobile={isMobile}
                  onSelect={handleSelect}
                  onCloseMobile={handleCloseMobile}
                  disableFlyoutOnActive
                />
            </div>
            <div className="border-t border-line pointer-events-auto">
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
          <div className="flex h-dvh">
            <SideNav/>
            <div className="flex-grow w-full better-scroll">
              <Routes>
                <Route path="/components/*" element={<ComponentsLayout/>}>
                  <Route path="buttons" element={<ExampleButtons/>}/>
                  <Route path="form" element={<ExampleForm/>}/>
                  <Route path="popover" element={<ExamplePopOver/>}/>
                  <Route path="modal" element={<ExampleModal/>}/>
                  <Route path="snackbar" element={<ExampleSnackbar/>}/>
                  <Route path="tabs" element={<ExampleTabs/>}/>
                  <Route path="skeleton" element={<ExampleSkeleton/>}/>
                  <Route path="tooltip" element={<ExampleTooltip/>}/>
                  <Route path="progress-bar" element={<ExampleProgressBar/>}/>
                  <Route path="pagination" element={<ExamplePagination/>}/>
                  <Route path="typography" element={<ExampleTypography/>}/>
                  <Route path="select" element={<SelectPage/>}/>
                  <Route path="date-picker" element={<DatePickerPage/>}/>
                  <Route path="context-menu" element={<ContextMenuPage/>}/>
                  <Route path="carousel" element={<CarouselPage/>}/>
                  <Route path="image-uploader" element={<ImageUploaderPage/>}/>
                  <Route path="image-zoom-pan" element={<ImageZoomPanPage/>}/>
                  <Route path="file-uploader" element={<FileUploaderPage/>}/>
                  <Route path="table" element={<TablePage/>}/>
                  <Route path="alert" element={<AlertPage/>}/>
                  <Route path="badge" element={<BadgePage/>}/>
                  <Route path="button-group" element={<ButtonGroupPage/>}/>
                  <Route path="drawer" element={<DrawerPage/>}/>
                  <Route path="number-spinner" element={<NumberSpinnerPage/>}/>
                  <Route path="switch" element={<SwitchPage/>}/>
                  <Route path="checkbox" element={<CheckboxPage/>}/>
                  <Route path="masked-input" element={<MaskedInputPage/>}/>
                  <Route path="input" element={<InputPage/>}/>
                </Route>
                <Route path="/form-sizes" element={<FormSizesPage/>}/>
                <Route path="/nav-modal" element={<SettingsModalPage/>}/>
                <Route path="/server-pagination" element={<ServerPaginationPage/>}/>
                <Route path="/font-compare" element={<FontComparePage/>}/>
                <Route path="/text-shift" element={<TextShiftPage/>}/>
                <Route path="/page-nav" element={<PageNavPage/>}/>
                <Route path="/page-nav-table" element={<PageNavTablePage/>}/>
                <Route path="/mobile-header" element={<MobileHeaderPage/>}>
                  <Route path="article/:id" element={<ArticleDetailPage/>}/>
                </Route>
                <Route path="/page-examples" element={<PageExamplesLayout/>}>
                  <Route index element={<Navigate to="/page-examples/list-detail" replace/>}/>
                  <Route path="list-detail" element={<PurchaseOrdersExample/>}/>
                  <Route path="list-detail/:poId" element={<PurchaseOrdersExample/>}/>
                  <Route path="list-detail-filters" element={<AssetsExample/>}/>
                  <Route path="list-detail-filters/:assetId" element={<AssetsExample/>}/>
                  <Route path="users" element={<UsersExample/>}/>
                </Route>
                <Route path="/debug" element={<DebugPage/>}/>
                <Route path="/debug/disabled-state" element={<DisabledStatePage/>}/>
                <Route path="*" element={
                  <div className="page-content">
                    <h1 className="heading-1 mb-4">Dashboard</h1>
                    <p className="text-subtle">Select a component from the sidebar to view its example.</p>
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