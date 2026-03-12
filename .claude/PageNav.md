# PageNav

Responsive panel navigation. Desktop: panels side-by-side (consumer layout). Mobile: iOS-style slide transitions with a sticky header.

## Exports

- `PageNav` — Wrapper. Manages nav stack, mobile detection, provides render prop context.
- `PageNavPanel` — Panel wrapper. Reads nav state via context. Desktop: plain `<div>`. Mobile: absolutely positioned with slide transitions.

## Basic Usage

```tsx
import { PageNav, PageNavPanel } from 'tsp-form';

function MyPage() {
  const [selected, setSelected] = useState(null);

  return (
    <PageNav panels={['list', 'detail']} mobileBreakpoint={768} className="h-dvh">
      {({ isMobile, isRoot, goTo, goBack, Header }) => (
        <>
          {isMobile && (
            <Header
              title={isRoot ? 'Items' : selected?.name}
              startContent={isRoot ? <MyHamburgerButton /> : undefined}
              endContent={<MySettingsButton />}
            />
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

## PageNav Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `panels` | `string[]` | required | Panel IDs. First is root. |
| `defaultPanel` | `string` | `panels[0]` | Initial active panel |
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
| `Header` | `(props) => ReactNode` | Mobile header component (returns `null` on desktop) |

## Header Props

| Prop | Type | Description |
|------|------|-------------|
| `title` | `ReactNode` | Centered, truncated title |
| `startContent` | `ReactNode` | Left side (shown at root or alongside back button) |
| `endContent` | `ReactNode` | Right side |
| `className` | `string` | Additional class on header |

When not at root, a back button (Chevron left) is automatically shown.

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

### Desktop header
`Header` returns `null` on desktop — render your own desktop header conditionally:
```tsx
{!isMobile && <div className="px-6 py-4 border-b border-line">...</div>}
```

## SideMenu Integration

On mobile, PageNav sets `data-pagenav-active` on `document.body`, which hides the SideMenu's built-in mobile toggle button via CSS. To let users still open the side menu, dispatch a custom event:

```tsx
window.dispatchEvent(new CustomEvent('sidemenu:open'));
```

Put this in a hamburger button and pass it as `startContent` to `Header` at root:
```tsx
<Header
  title="My Page"
  startContent={isRoot ? <HamburgerButton /> : undefined}
/>
```

## Behavior Notes

- **Nav stack resets on resize**: When `isMobile` changes `true` → `false`, the stack resets to `[panels[0]]`.
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
