import { useState } from 'react';
import { PopOver } from '../../components/PopOver';
import { Button } from '../../components/Button';

export function ExamplePopOver() {
  const [bottomOpen, setBottomOpen] = useState(false);
  const [topOpen, setTopOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [alignmentDemo, setAlignmentDemo] = useState(false);

  // Alignment demo states
  const [startOpen, setStartOpen] = useState(false);
  const [centerOpen, setCenterOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [rStartOpen, setRStartOpen] = useState(false);
  const [lEndOpen, setLEndOpen] = useState(false);
  const [tStartOpen, setTStartOpen] = useState(false);
  const [tCenterOpen, setTCenterOpen] = useState(false);
  const [tEndOpen, setTEndOpen] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  // Context menu states
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  return (
    <div className="page-content grid">
      <div className="grid gap-6">
        {/* Basic Placements */}
        <div>
          <h3 className="text-lg font-medium mb-3">Basic Placements</h3>
          <div className="flex flex-wrap gap-4">
            <PopOver
              isOpen={bottomOpen}
              onClose={() => setBottomOpen(false)}
              placement="bottom"
              trigger={
                <Button
                  variant="outline"
                  onClick={() => setBottomOpen(!bottomOpen)}
                >
                  Bottom PopOver
                </Button>
              }
            >
              <div className="p-4">
                <h4 className="font-semibold mb-2">Bottom PopOver</h4>
                <p className="text-sm text-gray-600 mb-3">
                  This popover appears below the trigger button and auto-positions itself.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setNestedOpen(true)}>Action</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBottomOpen(false)}
                  >
                    Close
                  </Button>
                  <PopOver
                    isOpen={nestedOpen}
                    onClose={() => setBottomOpen(false)}
                    placement="bottom"
                    trigger={
                      <Button
                        onClick={() => setNestedOpen(true)}
                      >
                        Bottom PopOver
                      </Button>
                    }>
                    This is nested popover
                    <Button onClick={() => setNestedOpen(false)}>
                      Close
                    </Button>
                  </PopOver>

                </div>
              </div>
            </PopOver>

            <PopOver
              isOpen={topOpen}
              onClose={() => setTopOpen(false)}
              placement="top"
              trigger={
                <Button
                  variant="outline"
                  onClick={() => setTopOpen(!topOpen)}
                >
                  Top PopOver
                </Button>
              }
            >
              <div className="p-4">
                <h4 className="font-semibold mb-2">Top PopOver</h4>
                <p className="text-sm text-gray-600 mb-3">
                  This popover appears above the trigger button.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTopOpen(false)}
                >
                  Close
                </Button>
              </div>
            </PopOver>

            <PopOver
              isOpen={leftOpen}
              onClose={() => setLeftOpen(false)}
              placement="left"
              trigger={
                <Button
                  variant="outline"
                  onClick={() => setLeftOpen(!leftOpen)}
                >
                  Left
                </Button>
              }
            >
              <div className="p-4">
                <h4 className="font-semibold mb-2">Left PopOver</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Appears to the left of the trigger.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLeftOpen(false)}
                >
                  Close
                </Button>
              </div>
            </PopOver>

            <PopOver
              isOpen={rightOpen}
              onClose={() => setRightOpen(false)}
              placement="right"
              offset={-4}
              trigger={
                <Button
                  variant="outline"
                  onClick={() => setRightOpen(!rightOpen)}
                >
                  Right
                </Button>
              }
            >
              <div className="p-4">
                <h4 className="font-semibold mb-2">Right PopOver</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Appears to the right of the trigger with negative offset (-4px).
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRightOpen(false)}
                >
                  Close
                </Button>
              </div>
            </PopOver>
          </div>
        </div>

        {/* Alignment Demo */}
        <div>
          <h3 className="text-lg font-medium mb-3">Alignment Options</h3>
          <p className="text-sm text-gray-600 mb-4">Click buttons to see how alignment works with each placement:</p>

          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-4 w-fit">
              {/* Top Row - Bottom placement with different alignments */}
              <PopOver
                isOpen={startOpen}
                onClose={() => setStartOpen(false)}
                placement="bottom"
                align="start"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStartOpen(!startOpen)}
                  >
                    Start
                  </Button>
                }
              >
                <div className="p-3">
                  <p className="text-sm font-medium">Bottom + Start</p>
                  <p className="text-xs text-gray-500">Left-aligned with trigger</p>
                </div>
              </PopOver>

              <PopOver
                isOpen={centerOpen}
                onClose={() => setCenterOpen(false)}
                placement="bottom"
                align="center"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCenterOpen(!centerOpen)}
                  >
                    Center
                  </Button>
                }
              >
                <div className="p-3">
                  <p className="text-sm font-medium">Bottom + Center</p>
                  <p className="text-xs text-gray-500">Center-aligned with trigger</p>
                </div>
              </PopOver>

              <div>
                <PopOver
                  isOpen={endOpen}
                  onClose={() => setEndOpen(false)}
                  placement="bottom"
                  align="end"
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEndOpen(!endOpen)}
                    >
                      End
                    </Button>
                  }
                >
                  <div className="p-3">
                    <p className="text-sm font-medium">Bottom + End</p>
                    <p className="text-xs text-gray-500">Right-aligned with trigger</p>
                  </div>
                </PopOver>
              </div>

              {/* Middle Row - Side placements */}
              <PopOver
                isOpen={rStartOpen}
                onClose={() => setRStartOpen(false)}
                placement="right"
                align="start"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRStartOpen(!rStartOpen)}
                  >
                    R-Start
                  </Button>
                }
              >
                <div className="p-3">
                  <p className="text-sm font-medium">Right + Start</p>
                  <p className="text-xs text-gray-500">Top-aligned with trigger</p>
                </div>
              </PopOver>

              {/* Center button for interactive demo */}
              <PopOver
                isOpen={alignmentDemo}
                onClose={() => setAlignmentDemo(false)}
                placement="bottom"
                align="center"
                trigger={
                  <Button
                    onClick={() => setAlignmentDemo(!alignmentDemo)}
                    size="sm"
                  >
                    Demo
                  </Button>
                }
              >
                <div className="p-4 w-64">
                  <h4 className="font-semibold mb-2">Interactive Demo</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    This popover is center-aligned and demonstrates the alignment feature.
                    Try scrolling or resizing the window.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAlignmentDemo(false)}
                  >
                    Close
                  </Button>
                </div>
              </PopOver>

              <PopOver
                isOpen={lEndOpen}
                onClose={() => setLEndOpen(false)}
                placement="left"
                align="end"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLEndOpen(!lEndOpen)}
                  >
                    L-End
                  </Button>
                }
              >
                <div className="p-3">
                  <p className="text-sm font-medium">Left + End</p>
                  <p className="text-xs text-gray-500">Bottom-aligned with trigger</p>
                </div>
              </PopOver>

              {/* Bottom Row - Top placement with different alignments */}
              <PopOver
                isOpen={tStartOpen}
                onClose={() => setTStartOpen(false)}
                placement="top"
                align="start"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTStartOpen(!tStartOpen)}
                  >
                    T-Start
                  </Button>
                }
              >
                <div className="p-3">
                  <p className="text-sm font-medium">Top + Start</p>
                  <p className="text-xs text-gray-500">Left-aligned with trigger</p>
                </div>
              </PopOver>

              <PopOver
                isOpen={tCenterOpen}
                onClose={() => setTCenterOpen(false)}
                placement="top"
                align="center"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTCenterOpen(!tCenterOpen)}
                  >
                    T-Center
                  </Button>
                }
              >
                <div className="p-3">
                  <p className="text-sm font-medium">Top + Center</p>
                  <p className="text-xs text-gray-500">Center-aligned with trigger</p>
                </div>
              </PopOver>

              <PopOver
                isOpen={tEndOpen}
                onClose={() => setTEndOpen(false)}
                placement="top"
                align="end"
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTEndOpen(!tEndOpen)}
                  >
                    T-End
                  </Button>
                }
              >
                <div className="p-3">
                  <p className="text-sm font-medium">Top + End</p>
                  <p className="text-xs text-gray-500">Right-aligned with trigger</p>
                </div>
              </PopOver>
            </div>
          </div>
        </div>

        {/* Context Menu Example */}
        <div>
          <h3 className="text-lg font-medium mb-3">Context Menu with Submenu</h3>
          <p className="text-sm text-gray-600 mb-4">Hover over "More Options" to see a submenu appear without gap</p>
          <div className="flex flex-wrap gap-4">
            <PopOver
              isOpen={contextMenuOpen}
              onClose={() => {
                setContextMenuOpen(false);
                setSubmenuOpen(false);
              }}
              placement="bottom"
              align="start"
              trigger={
                <Button onClick={() => setContextMenuOpen(!contextMenuOpen)}>
                  Open Context Menu
                </Button>
              }
            >
              <div className="py-1 min-w-[180px]">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer">
                  Cut
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer">
                  Copy
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer">
                  Paste
                </button>
                <hr className="my-1 border-line"/>

                <PopOver
                  isOpen={submenuOpen}
                  onClose={() => setSubmenuOpen(false)}
                  placement="right"
                  align="start"
                  offset={0}
                  trigger={
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer flex items-center justify-between"
                      onMouseEnter={() => setSubmenuOpen(true)}
                      onMouseLeave={(e) => {
                        // Don't close if moving to submenu
                        const rect = e.currentTarget.getBoundingClientRect();
                        const isMovingRight = e.clientX > rect.right;
                        if (!isMovingRight) setSubmenuOpen(false);
                      }}
                    >
                      More Options
                      <span className="ml-2">▶</span>
                    </button>
                  }
                >
                  <div
                    className="py-1 min-w-[160px]"
                    onMouseLeave={() => setSubmenuOpen(false)}
                  >
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer">
                      Rename
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer">
                      Duplicate
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer">
                      Move to...
                    </button>
                    <hr className="my-1 border-line"/>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover text-danger transition-colors cursor-pointer">
                      Delete
                    </button>
                  </div>
                </PopOver>

                <hr className="my-1 border-line"/>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors cursor-pointer">
                  Properties
                </button>
              </div>
            </PopOver>
          </div>
        </div>

        {/* Rich Content Example */}
        <div>
          <h3 className="text-lg font-medium mb-3">Rich Content</h3>
          <div className="flex flex-wrap gap-4">
            <PopOver
              isOpen={statusOpen}
              onClose={() => setStatusOpen(false)}
              placement="bottom"
              align="end"
              maxWidth="500px"
              trigger={
                <Button color="primary" onClick={() => setStatusOpen(!statusOpen)}>
                  Status Menu (End Aligned)
                </Button>
              }
            >
              <div className="p-4 w-80">
                <h4 className="font-semibold mb-3">User Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <span className="text-sm font-medium">Online</span>
                      <p className="text-xs text-gray-500">Available for chat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <span className="text-sm font-medium">Away</span>
                      <p className="text-xs text-gray-500">Back in a few minutes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <span className="text-sm font-medium">Busy</span>
                      <p className="text-xs text-gray-500">Do not disturb</p>
                    </div>
                  </div>
                </div>
                <hr className="my-3"/>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">Settings</Button>
                  <Button size="sm" variant="ghost">Sign Out</Button>
                </div>
              </div>
            </PopOver>
          </div>
        </div>

      </div>
    </div>
  );
}