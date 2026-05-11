// Page-level left side nav for the Page Examples section.
// Mirrors the consumer's InventoryLayout pattern: a thin column of icon links
// + group separators, hidden below the `lg` breakpoint.

import type { ComponentType } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { ClipboardList, Box, Users } from 'lucide-react';

type NavItem =
  | { type: 'link'; path: string; label: string; icon: ComponentType<{ size?: number }> }
  | { type: 'group'; label: string };

const navItems: NavItem[] = [
  { type: 'group', label: 'PageNav patterns' },
  { type: 'link', path: '/page-examples/list-detail', label: 'List + Detail', icon: ClipboardList },
  { type: 'link', path: '/page-examples/list-detail-filters', label: 'List + Detail w/ Filters', icon: Box },
  { type: 'group', label: 'Admin' },
  { type: 'link', path: '/page-examples/users', label: 'Users', icon: Users },
];

export function PageExamplesLayout() {
  const location = useLocation();
  return (
    <div className="flex h-dvh">
      <nav className="hidden lg:flex flex-col gap-1 shrink-0 w-50 border-r border-line p-4 pt-8">
        {navItems.map((item, i) => {
          if (item.type === 'group') {
            return (
              <span
                key={item.label}
                className={`text-[11px] text-subtle uppercase tracking-wider px-2 ${i > 0 ? 'mt-3 mb-1' : 'mb-1'}`}
              >
                {item.label}
              </span>
            );
          }
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-item-active-bg text-item-active-fg font-medium'
                  : 'text-item-fg hover:bg-item-hover-bg hover:text-item-hover-fg'
              }`}
            >
              <Icon size={15} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="flex-1 min-w-0 h-full overflow-auto better-scroll">
        <Outlet />
      </div>
    </div>
  );
}
