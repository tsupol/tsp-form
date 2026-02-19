import { useState, ReactNode } from 'react';
import { Modal } from '../../components/Modal';
import { PopOver } from '../../components/PopOver';
import { ChevronRight, ChevronLeft, X, Bell, Shield, Palette, User, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import '../../styles/scroll.css';

type NavPage = {
  id: string;
  title: string;
  content: ReactNode;
};

// Menu item with chevron (navigable)
function NavMenuItem({ icon, label, onClick }: {
  icon?: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-3 border-b border-line"
      onClick={onClick}
    >
      {icon && <span className="w-5 h-5 flex items-center justify-center opacity-70">{icon}</span>}
      <span className="flex-1">{label}</span>
      <ChevronRight size={18} className="opacity-40" />
    </button>
  );
}

// Menu item with toggle
function ToggleMenuItem({ icon, label, checked, onChange }: {
  icon?: ReactNode;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="w-full px-4 py-3 flex items-center gap-3 border-b border-line">
      {icon && <span className="w-5 h-5 flex items-center justify-center opacity-70">{icon}</span>}
      <span className="flex-1">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          'w-11 h-6 rounded-full transition-colors relative cursor-pointer',
          checked ? 'bg-primary' : 'bg-surface-elevated'
        )}
      >
        <div
          className={clsx(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

// Menu item with popover selection
function SelectMenuItem({ icon, label, value, options, onChange }: {
  icon?: ReactNode;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <PopOver
      isOpen={open}
      onClose={() => setOpen(false)}
      placement="bottom"
      align="end"
      offset={4}
      openDelay={0}
      triggerClassName="w-full"
      trigger={
        <button
          className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-3 border-b border-line"
          onClick={() => setOpen(!open)}
        >
          {icon && <span className="w-5 h-5 flex items-center justify-center opacity-70">{icon}</span>}
          <span className="flex-1">{label}</span>
          <span className="text-sm opacity-60">{options.find(o => o.value === value)?.label}</span>
        </button>
      }
    >
      <div className="py-1 min-w-[120px]">
        {options.map((option) => (
          <button
            key={option.value}
            className={clsx(
              'w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer',
              value === option.value && 'text-primary'
            )}
            onClick={() => {
              onChange(option.value);
              setOpen(false);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </PopOver>
  );
}

// iOS-style navigation modal
function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [navStack, setNavStack] = useState<NavPage[]>([]);

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState('system');

  const pushPage = (page: NavPage) => {
    setNavStack([...navStack, page]);
  };

  const popPage = () => {
    if (navStack.length > 0) {
      setNavStack(navStack.slice(0, -1));
    }
  };

  const handleClose = () => {
    setNavStack([]);
    onClose();
  };

  const currentPage = navStack[navStack.length - 1];
  const isRoot = navStack.length === 0;

  // Sub-pages content
  const accountPage: NavPage = {
    id: 'account',
    title: 'Account',
    content: (
      <div>
        <div className="px-4 py-3 border-b border-line">
          <div className="text-sm opacity-60">Email</div>
          <div>john.doe@example.com</div>
        </div>
        <div className="px-4 py-3 border-b border-line">
          <div className="text-sm opacity-60">Plan</div>
          <div>Pro</div>
        </div>
        <button className="w-full text-left px-4 py-3 text-primary hover:bg-surface-hover transition-colors">
          Change password
        </button>
      </div>
    ),
  };

  const notificationsPage: NavPage = {
    id: 'notifications',
    title: 'Notifications',
    content: (
      <div>
        <ToggleMenuItem
          label="Push notifications"
          checked={notifications}
          onChange={setNotifications}
        />
        <ToggleMenuItem
          label="Email notifications"
          checked={true}
          onChange={() => {}}
        />
        <ToggleMenuItem
          label="Sound"
          checked={false}
          onChange={() => {}}
        />
      </div>
    ),
  };

  const privacyPage: NavPage = {
    id: 'privacy',
    title: 'Privacy',
    content: (
      <div>
        <ToggleMenuItem
          label="Analytics"
          checked={true}
          onChange={() => {}}
        />
        <ToggleMenuItem
          label="Personalization"
          checked={true}
          onChange={() => {}}
        />
        <button className="w-full text-left px-4 py-3 text-danger hover:bg-surface-hover transition-colors border-b border-line">
          Delete account
        </button>
      </div>
    ),
  };

  const helpPage: NavPage = {
    id: 'help',
    title: 'Help & Support',
    content: (
      <div>
        <button className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors border-b border-line">
          FAQ
        </button>
        <button className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors border-b border-line">
          Contact Support
        </button>
        <button className="w-full text-left px-4 py-3 hover:bg-surface-hover transition-colors border-b border-line">
          Report a bug
        </button>
        <div className="px-4 py-3 text-sm opacity-60">
          Version 1.0.0
        </div>
      </div>
    ),
  };

  // Root menu
  const rootContent = (
    <div>
      <NavMenuItem icon={<User size={18} />} label="Account" onClick={() => pushPage(accountPage)} />
      <NavMenuItem icon={<Bell size={18} />} label="Notifications" onClick={() => pushPage(notificationsPage)} />
      <SelectMenuItem
        icon={<Palette size={18} />}
        label="Appearance"
        value={theme}
        options={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'System', value: 'system' },
        ]}
        onChange={setTheme}
      />
      <NavMenuItem icon={<Shield size={18} />} label="Privacy" onClick={() => pushPage(privacyPage)} />
      <NavMenuItem icon={<HelpCircle size={18} />} label="Help & Support" onClick={() => pushPage(helpPage)} />
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      width="360px"
      height="480px"
      maxWidth="90vw"
      maxHeight="90vh"
      style={{ overflow: 'hidden' }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center h-12 border-b border-line shrink-0 relative">
          <button
            className="w-12 h-12 flex items-center justify-center hover:bg-surface-hover transition-colors cursor-pointer"
            onClick={isRoot ? handleClose : popPage}
          >
            {isRoot ? <X size={20} /> : <ChevronLeft size={20} />}
          </button>
          <h2 className="absolute left-1/2 -translate-x-1/2 font-medium">
            {isRoot ? 'Settings' : currentPage?.title}
          </h2>
        </header>

        {/* Content with iOS-style slide animation */}
        <div className="flex-1 overflow-hidden relative">
          {/* Root page - always rendered */}
          <div
            className="absolute inset-0 better-scroll"
            style={{
              transform: isRoot
                ? 'translateX(0)'
                : 'translateX(-30%)',
              opacity: isRoot ? 1 : 0.5,
              transition: 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1), opacity 350ms cubic-bezier(0.32, 0.72, 0, 1)',
              pointerEvents: isRoot ? 'auto' : 'none',
            }}
          >
            {rootContent}
          </div>

          {/* Subpage - slides in from right */}
          <div
            className="absolute inset-0 better-scroll bg-surface"
            style={{
              transform: currentPage ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 350ms cubic-bezier(0.32, 0.72, 0, 1)',
              pointerEvents: currentPage ? 'auto' : 'none',
            }}
          >
            {currentPage?.content}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function SettingsModalPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="page-content">
      <div className="grid gap-4">
        <div className="card space-y-4 w-full max-w-[700px]">
          <h1 className="heading-1 mb-2">iOS-Style Navigation Modal</h1>
          <p className="text-sm text-muted mb-4">
            A modal with sliding page navigation, similar to iOS settings. Click items with chevrons to navigate deeper, use back button to return.
          </p>

          <button
            className="px-4 py-2 bg-primary text-primary-contrast rounded-lg hover:bg-primary-hover transition-colors cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            Open Settings Modal
          </button>

          <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
      </div>
    </div>
  );
}
