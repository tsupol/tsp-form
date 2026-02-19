import { useState, useCallback, MouseEvent } from 'react';
import { PopOver } from '../../components/PopOver';
import { MenuItem, MenuSeparator, SubMenu } from '../../components/Menu';
import { Scissors, Copy, ClipboardPaste, Plus, Type, Image, Shapes, Square, Circle, Triangle, Table, PaintBucket, Bold, Italic, AlignLeft, AlignCenter, AlignRight, MousePointer2, Trash2, Command } from 'lucide-react';

interface MenuPosition {
  x: number;
  y: number;
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
        <div className="card space-y-4 w-full max-w-[700px]">
          <h1 className="heading-1 mb-2">Context Menu (Nested)</h1>
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
              <MenuItem icon={<Scissors size={16} />} label="Cut" rightIcon={<Command size={14} />} onClick={() => handleAction('Cut')}/>
              <MenuItem icon={<Copy size={16} />} label="Copy" onClick={() => handleAction('Copy')}/>
              <MenuItem icon={<ClipboardPaste size={16} />} label="Paste" onClick={() => handleAction('Paste')}/>

              <MenuSeparator />

              <SubMenu icon={<Plus size={16} />} label="Insert">
                <MenuItem icon={<Type size={16} />} label="Text" onClick={() => handleAction('Insert > Text')}/>
                <MenuItem icon={<Image size={16} />} label="Image" onClick={() => handleAction('Insert > Image')}/>
                <SubMenu icon={<Shapes size={16} />} label="Shape">
                  <MenuItem icon={<Square size={16} />} label="Rectangle" onClick={() => handleAction('Insert > Shape > Rectangle')}/>
                  <MenuItem icon={<Circle size={16} />} label="Circle" onClick={() => handleAction('Insert > Shape > Circle')}/>
                  <MenuItem icon={<Triangle size={16} />} label="Triangle" onClick={() => handleAction('Insert > Shape > Triangle')}/>
                </SubMenu>
                <MenuItem icon={<Table size={16} />} label="Table" onClick={() => handleAction('Insert > Table')}/>
              </SubMenu>

              <SubMenu icon={<PaintBucket size={16} />} label="Format">
                <MenuItem icon={<Bold size={16} />} label="Bold" onClick={() => handleAction('Format > Bold')}/>
                <MenuItem icon={<Italic size={16} />} label="Italic" onClick={() => handleAction('Format > Italic')}/>
                <SubMenu icon={<AlignLeft size={16} />} label="Alignment">
                  <MenuItem icon={<AlignLeft size={16} />} label="Left" onClick={() => handleAction('Format > Alignment > Left')}/>
                  <MenuItem icon={<AlignCenter size={16} />} label="Center" onClick={() => handleAction('Format > Alignment > Center')}/>
                  <MenuItem icon={<AlignRight size={16} />} label="Right" onClick={() => handleAction('Format > Alignment > Right')}/>
                </SubMenu>
              </SubMenu>

              <MenuSeparator />

              <MenuItem icon={<MousePointer2 size={16} />} label="Select All" onClick={() => handleAction('Select All')}/>
              <MenuItem icon={<Trash2 size={16} />} label="Delete" onClick={() => handleAction('Delete')} danger/>
            </div>
          </PopOver>
        </div>
      </div>
    </div>
  );
}
