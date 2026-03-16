# PageNav

Responsive panel navigation. Desktop: panels side-by-side (consumer layout). Mobile: iOS-style slide transitions.

**No built-in header** — consumers build their own header using `goBack`, `isRoot`, `isMobile` from the render prop context. This gives full control over back button icon, sidemenu toggle, layout, and behavior (e.g. router-based back vs `goBack()`).

## Exports

- `PageNav` — Wrapper. Manages nav stack, mobile detection, provides render prop context.
- `PageNavPanel` — Panel wrapper. Reads nav state via context. Desktop: plain `<div>`. Mobile: absolutely positioned with slide transitions.

## Non-routed Usage (useState)

Selection lives in local state. Lost on refresh. See `src/example/pages/PageNavTablePage.tsx`.

```tsx
import { PageNav, PageNavPanel } from 'tsp-form';

function MyPage() {
  const [selected, setSelected] = useState(null);

  return (
    <PageNav panels={['list', 'detail']} mobileBreakpoint={768} className="h-dvh">
      {({ isMobile, isRoot, goTo, goBack }) => (
        <>
          {isMobile && (
            <div className="pagenav-header">
              <div className="pagenav-header-start">
                {isRoot ? <MyMenuToggle /> : (
                  <button className="pagenav-back-btn" onClick={goBack} aria-label="Go back">
                    <ArrowLeft size={20} />
                  </button>
                )}
              </div>
              <div className="pagenav-header-title">{isRoot ? 'Items' : selected?.name}</div>
            </div>
          )}
          <div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
            <PageNavPanel id="list" className="w-80 border-r border-line">
              <ItemList onSelect={(item) => {
                setSelected(item);
                if (isMobile) goTo('detail');
              }} />
            </PageNavPanel>
            <PageNavPanel id="detail" className="flex-1">
              <ItemDetail item={selected} />
            </PageNavPanel>
          </div>
        </>
      )}
    </PageNav>
  );
}
```

## Routed Usage (search params)

Selection lives in URL search params (e.g. `?lesson=3`). Survives refresh and is shareable. See `src/example/pages/PageNavPage.tsx`.

Key patterns:
1. Read selection from `useSearchParams`, not local state.
2. Set `defaultPanel` based on whether a param exists on mount — ensures refresh on detail panel starts correctly (with `isRoot=false`).
3. When navigating to child: set the search param + call `goTo()`.
4. When going back: clear the search param + call `goBack()`.
5. Build your own header with full control over icons and behavior.

```tsx
import { useSearchParams } from 'react-router-dom';
import { PageNav, PageNavPanel } from 'tsp-form';

function MyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('item');
  const goToRef = useRef<(id: string) => void>();
  const isMobileRef = useRef(false);

  const selectItem = (id: string) => {
    setSearchParams({ item: id }, { replace: true });
    if (isMobileRef.current) goToRef.current?.('detail');
  };

  const handleBack = (goBack: () => void) => {
    setSearchParams({}, { replace: true });
    goBack();
  };

  // Start on detail panel if URL has ?item= on mount (refresh/deep-link)
  const initialPanel = selectedId ? 'detail' : 'list';

  return (
    <PageNav panels={['list', 'detail']} defaultPanel={initialPanel} className="h-dvh">
      {({ isMobile, isRoot, goTo, goBack }) => {
        goToRef.current = goTo;
        isMobileRef.current = isMobile;

        return (
          <>
            {isMobile && (
              <div className="pagenav-header">
                <div className="pagenav-header-start">
                  {isRoot ? <MyMenuToggle /> : (
                    <button className="pagenav-back-btn" onClick={() => handleBack(goBack)}>
                      <ArrowLeft size={20} />
                    </button>
                  )}
                </div>
                <div className="pagenav-header-title">{isRoot ? 'Items' : selectedItem?.name}</div>
              </div>
            )}
            <div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
              <PageNavPanel id="list" className="w-80 border-r border-line">
                <ItemList onSelect={selectItem} />
              </PageNavPanel>
              <PageNavPanel id="detail" className="flex-1">
                <ItemDetail id={selectedId} />
              </PageNavPanel>
            </div>
          </>
        );
      }}
    </PageNav>
  );
}
```

## PageNav Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `panels` | `string[]` | required | Panel IDs. First is root. |
| `defaultPanel` | `string` | `panels[0]` | Initial active panel. When set to a non-root panel, the nav stack is auto-populated from root → target so `isRoot` is correctly `false`. |
| `mobileBreakpoint` | `number` | `768` | px width threshold for mobile mode |
| `className` | `string` | — | Class on the outer wrapper (`.pagenav`) |
| `children` | `(ctx) => ReactNode` | required | Render prop |

## Render Prop Context

| Field | Type | Description |
|-------|------|-------------|
| `activePanel` | `string` | Currently active panel ID |
| `parentPanel` | `string \| null` | Previous panel in stack (`null` if root) |
| `isMobile` | `boolean` | Whether in mobile mode |
| `isRoot` | `boolean` | Whether at root panel |
| `goTo(id)` | `(string) => void` | Navigate to panel (slides in from right) |
| `goBack()` | `() => void` | Go back one level (slides back left) |
| `goToRoot()` | `() => void` | Reset to root panel |

## Header CSS Classes

PageNav provides CSS classes for building your own header. No built-in header component — you compose these yourself:

| Class | Description |
|-------|-------------|
| `pagenav-header` | Sticky header bar (3rem height, border-bottom, flex) |
| `pagenav-header-start` | Left section (flex, z-index above title) |
| `pagenav-header-end` | Right section (margin-left: auto, z-index above title) |
| `pagenav-header-title` | Centered, truncated title (absolute positioned) |
| `pagenav-back-btn` | Back button style (3rem square, inherits text color, hover bg) |

## PageNavPanel Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Must match one of the panel IDs in `panels` |
| `className` | `string` | Applied on **desktop** only |
| `mobileClassName` | `string` | Applied on **mobile** only (in addition to `.pagenav-panel`) |
| `children` | `ReactNode` | Panel content |

## Key Layout Patterns

### Mobile panels container
Wrap `<PageNavPanel>` elements in a div with `className="pagenav-panels"` on mobile. This provides the `position: relative; overflow: hidden` container needed for absolutely positioned panel transitions.

```tsx
<div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
  <PageNavPanel id="list" ...>
  <PageNavPanel id="detail" ...>
</div>
```

### Full-page layout
Use `className="h-dvh"` on `<PageNav>` to fill the viewport. The `.pagenav` class is `display: flex; flex-direction: column`, so header + panels container will stack and the panels container can use `flex-1` to fill remaining space.

## SideMenu Integration

On mobile, PageNav sets `data-pagenav-active` on `document.body`, which hides the SideMenu's built-in mobile toggle button via CSS. To let users still open the side menu, dispatch a custom event in your header's root state:

```tsx
window.dispatchEvent(new CustomEvent('sidemenu:open'));
```

## Behavior Notes

- **Nav stack resets on resize**: When `isMobile` changes `true` → `false`, the stack resets to `[panels[0]]`.
- **defaultPanel deep-link**: When `defaultPanel` is not the root panel, the stack is initialized as `panels.slice(0, targetIndex + 1)` so `isRoot`, `parentPanel`, and `goBack()` all work correctly.
- **All panels stay mounted**: Scroll position and form state are preserved across navigation.
- **Transition**: `350ms cubic-bezier(0.32, 0.72, 0, 1)` — same as iOS navigation.
  - Active: `translateX(0)`, opacity 1
  - Behind (parent): `translateX(-30%)`, opacity 0.5
  - Ahead (not visited): `translateX(100%)`
- **Ref counting**: Multiple PageNav instances on the same page correctly manage the `data-pagenav-active` attribute.

## CSS Variables

| Variable | Fallback | Description |
|----------|----------|-------------|
| `--color-pagenav-header-bg` | `--color-surface` | Header background |
| `--color-pagenav-panel-bg` | `--color-surface` | Panel background (mobile) |
