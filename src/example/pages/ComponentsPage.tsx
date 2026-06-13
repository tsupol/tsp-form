import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box, FileText, MessageSquare, Columns3, GalleryHorizontalEnd,
  Eye, Clock, BarChart3, ChevronsUpDown, CalendarDays, ToggleLeft,
  Table2, Type, MousePointerClick, Image, Upload, Hash,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { clsx } from 'clsx';

type ComponentEntry = {
  label: string;
  path: string;
  icon: ReactNode;
  description: string;
};

const components: ComponentEntry[] = [
  { label: 'Alert', path: '/components/alert', icon: <Box size={16} />, description: 'Dismissible alert banners' },
  { label: 'Badge', path: '/components/badge', icon: <Box size={16} />, description: 'Status and count badges' },
  { label: 'Button Group', path: '/components/button-group', icon: <Box size={16} />, description: 'Grouped button controls' },
  { label: 'Buttons', path: '/components/buttons', icon: <Box size={16} />, description: 'Button variants and sizes' },
  { label: 'Carousel', path: '/components/carousel', icon: <Image size={16} />, description: 'Image and content slider' },
  { label: 'Checkbox', path: '/components/checkbox', icon: <Box size={16} />, description: 'Checkbox form controls' },
  { label: 'Context Menu', path: '/components/context-menu', icon: <MousePointerClick size={16} />, description: 'Right-click menus' },
  { label: 'Date Picker', path: '/components/date-picker', icon: <CalendarDays size={16} />, description: 'Date and range pickers' },
  { label: 'Drawer', path: '/components/drawer', icon: <Columns3 size={16} />, description: 'Slide-in side panels' },
  { label: 'File Uploader', path: '/components/file-uploader', icon: <Upload size={16} />, description: 'File upload mechanics' },
  { label: 'Form', path: '/components/form', icon: <FileText size={16} />, description: 'Input, checkbox, radio, textarea' },
  { label: 'Image Uploader', path: '/components/image-uploader', icon: <Upload size={16} />, description: 'Image upload with preview' },
  { label: 'Image Zoom & Pan', path: '/components/image-zoom-pan', icon: <Image size={16} />, description: 'Pan, zoom, pinch image viewer' },
  { label: 'Input', path: '/components/input', icon: <FileText size={16} />, description: 'Text input with suggestions' },
  { label: 'Masked Input', path: '/components/masked-input', icon: <Hash size={16} />, description: 'Pattern and number formatting' },
  { label: 'Modal', path: '/components/modal', icon: <Columns3 size={16} />, description: 'Dialog overlays' },
  { label: 'Number Spinner', path: '/components/number-spinner', icon: <Hash size={16} />, description: 'Numeric input with +/- buttons' },
  { label: 'Pagination', path: '/components/pagination', icon: <ToggleLeft size={16} />, description: 'Page navigation controls' },
  { label: 'PopOver', path: '/components/popover', icon: <MessageSquare size={16} />, description: 'Floating content panels' },
  { label: 'Progress Bar', path: '/components/progress-bar', icon: <BarChart3 size={16} />, description: 'Progress indicators' },
  { label: 'Select', path: '/components/select', icon: <ChevronsUpDown size={16} />, description: 'Dropdown select menus' },
  { label: 'Skeleton', path: '/components/skeleton', icon: <Clock size={16} />, description: 'Loading placeholders' },
  { label: 'Snackbar', path: '/components/snackbar', icon: <MessageSquare size={16} />, description: 'Toast notifications' },
  { label: 'Switch (Toggle)', path: '/components/switch', icon: <ToggleLeft size={16} />, description: 'Toggle switch controls' },
  { label: 'Table', path: '/components/table', icon: <Table2 size={16} />, description: 'Data tables with sorting' },
  { label: 'Table theming', path: '/components/table-theming', icon: <Table2 size={16} />, description: 'Retheme rows via CSS vars' },
  { label: 'Tabs', path: '/components/tabs', icon: <GalleryHorizontalEnd size={16} />, description: 'Tabbed content switching' },
  { label: 'Tooltip', path: '/components/tooltip', icon: <Eye size={16} />, description: 'Hover info tips' },
  { label: 'Typography', path: '/components/typography', icon: <Type size={16} />, description: 'Text and prose styles' },
];

function ComponentsIndex() {
  const navigate = useNavigate();

  return (
    <div className="page-content">
      <h1 className="heading-1 mb-1">Components</h1>
      <p className="text-subtle mb-6">Browse all available components.</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-3">
        {components.map((c) => (
          <button
            key={c.path}
            className="card text-left cursor-pointer transition-colors hover:bg-surface-hover"
            onClick={() => navigate(c.path)}
          >
            <div className="flex items-center gap-2 mb-1 opacity-60">{c.icon}</div>
            <div className="font-medium">{c.label}</div>
            <div className="text-sm opacity-50 mt-0.5">{c.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ComponentNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="hidden lg:block w-56 shrink-0 border-r border-line overflow-y-auto better-scroll py-2 fixed top-0 h-dvh">
      {components.map((c) => (
        <button
          key={c.path}
          className={clsx(
            'flex items-center gap-2 w-full px-4 py-2 text-sm text-left cursor-pointer transition-colors',
            location.pathname === c.path
              ? 'bg-primary/10 text-primary-fg font-medium'
              : 'hover:bg-surface-hover'
          )}
          onClick={() => navigate(c.path)}
        >
          <span className="opacity-60 shrink-0">{c.icon}</span>
          <span className="truncate">{c.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function ComponentsLayout() {
  const location = useLocation();
  const isIndex = location.pathname === '/components';

  if (isIndex) {
    return <ComponentsIndex />;
  }

  return (
    <div>
      <ComponentNav />
      <div className="lg:ml-56">
        <Outlet />
      </div>
    </div>
  );
}
