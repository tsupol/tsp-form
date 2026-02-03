import { useState, useCallback, useRef, MouseEvent } from 'react';
import { PopOver } from '../../components/PopOver';

interface MenuPosition {
  x: number;
  y: number;
}

function MenuItem({ label, onClick, danger }: { label: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer ${danger ? 'text-danger' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SubMenu({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

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
          className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer flex items-center justify-between"
          onMouseEnter={() => { cancelClose(); setOpen(true); }}
          onMouseLeave={() => scheduleClose()}
        >
          {label}
          <span className="ml-2 text-xs">▶</span>
        </button>
      }
    >
      <div
        className="py-1 min-w-[160px]"
        onMouseEnter={() => cancelClose()}
        onMouseLeave={() => scheduleClose()}
      >
        {children}
      </div>
    </PopOver>
  );
}

export function ContextMenuPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPosition>({ x: 0, y: 0 });
  const [lastAction, setLastAction] = useState<string>('Right-click anywhere in the box below');

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleAction = useCallback((action: string) => {
    setLastAction(`Action: ${action}`);
    setMenuOpen(false);
  }, []);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setMenuOpen(true);
  }, []);

  return (
    <div className="page-content">
      <div className="grid gap-4">
        <div className="border border-line bg-surface p-card space-y-4 rounded-lg w-full max-w-[700px]">
          <h1 className="text-xl font-bold mb-2">Context Menu (Nested)</h1>
          <p className="text-sm text-muted mb-4">
            Right-click inside the area below to open a context menu with nested submenus.
          </p>

          {/* Right-click target area */}
          <div
            className="border-2 border-dashed border-line rounded-lg p-4 min-h-[150px] flex flex-col items-center justify-center select-none cursor-context-menu"
            onContextMenu={handleContextMenu}
          >
            <p className="text-muted text-sm">{lastAction}</p>
          </div>

          {/* Context menu anchored to click position using a hidden trigger */}
          <PopOver
            isOpen={menuOpen}
            onClose={closeMenu}
            placement="bottom"
            align="start"
            offset={0}
            openDelay={0}
            trigger={
              <div style={{ position: 'fixed', top: menuPos.y, left: menuPos.x, width: 0, height: 0 }}/>
            }
          >
            <div className="py-1 min-w-[180px]">
              <MenuItem label="Cut" onClick={() => handleAction('Cut')}/>
              <MenuItem label="Copy" onClick={() => handleAction('Copy')}/>
              <MenuItem label="Paste" onClick={() => handleAction('Paste')}/>

              <hr className="my-1 border-line"/>

              <SubMenu label="Insert">
                <MenuItem label="Text" onClick={() => handleAction('Insert > Text')}/>
                <MenuItem label="Image" onClick={() => handleAction('Insert > Image')}/>
                <SubMenu label="Shape">
                  <MenuItem label="Rectangle" onClick={() => handleAction('Insert > Shape > Rectangle')}/>
                  <MenuItem label="Circle" onClick={() => handleAction('Insert > Shape > Circle')}/>
                  <MenuItem label="Triangle" onClick={() => handleAction('Insert > Shape > Triangle')}/>
                </SubMenu>
                <MenuItem label="Table" onClick={() => handleAction('Insert > Table')}/>
              </SubMenu>

              <SubMenu label="Format">
                <MenuItem label="Bold" onClick={() => handleAction('Format > Bold')}/>
                <MenuItem label="Italic" onClick={() => handleAction('Format > Italic')}/>
                <SubMenu label="Alignment">
                  <MenuItem label="Left" onClick={() => handleAction('Format > Alignment > Left')}/>
                  <MenuItem label="Center" onClick={() => handleAction('Format > Alignment > Center')}/>
                  <MenuItem label="Right" onClick={() => handleAction('Format > Alignment > Right')}/>
                </SubMenu>
              </SubMenu>

              <hr className="my-1 border-line"/>

              <MenuItem label="Select All" onClick={() => handleAction('Select All')}/>
              <MenuItem label="Delete" onClick={() => handleAction('Delete')} danger/>
            </div>
          </PopOver>
        </div>
      </div>
    </div>
  );
}
