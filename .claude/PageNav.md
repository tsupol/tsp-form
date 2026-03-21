# PageNav

Responsive panel navigation. Desktop: panels side-by-side (consumer layout). Mobile: iOS-style slide transitions.

**No built-in header** — use `MobileHeader` (see `.claude/MobileHeader.md`). PageNav provides `goBack`, `isRoot`, `isMobile` from the render prop context for header logic.

## Exports

- `PageNav` — Wrapper. Manages nav stack, mobile detection, provides render prop context.
- `PageNavPanel` — Panel wrapper. Desktop: plain `<div>`. Mobile: absolutely positioned with slide transitions.

## Props

### PageNav

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `panels` | `string[]` | required | Panel IDs. First is root. |
| `defaultPanel` | `string` | `panels[0]` | Initial active panel. Auto-populates nav stack from root so `isRoot` is correct. |
| `mobileBreakpoint` | `number` | `768` | px width threshold for mobile mode |
| `className` | `string` | — | Class on outer wrapper |
| `children` | `(ctx) => ReactNode` | required | Render prop |

### PageNavPanel

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Must match one of `panels` |
| `className` | `string` | Applied on **desktop** only |
| `mobileClassName` | `string` | Applied on **mobile** only (in addition to `.pagenav-panel`) |

### Render Prop Context

| Field | Type | Description |
|-------|------|-------------|
| `activePanel` | `string` | Currently active panel ID |
| `parentPanel` | `string \| null` | Previous panel in stack |
| `isMobile` | `boolean` | Whether in mobile mode |
| `isRoot` | `boolean` | Whether at root panel |
| `goTo(id)` | fn | Navigate to panel (slides in from right) |
| `goBack()` | fn | Go back one level |
| `goToRoot()` | fn | Reset to root panel |

## Usage with MobileHeader

```tsx
import { PageNav, PageNavPanel } from 'tsp-form';
import { MobileHeader } from 'tsp-form';

<PageNav panels={['list', 'detail']} mobileBreakpoint={768} className="h-dvh">
  {({ isMobile, isRoot, goTo, goBack }) => (
    <>
      {isMobile && (
        <MobileHeader className={isRoot ? 'mobile-header-bordered' : undefined}>
          <div className="mobile-header-start">
            {isRoot ? <MyMenuToggle /> : (
              <button className="flex items-center justify-center w-nav h-nav cursor-pointer bg-transparent border-none text-current" onClick={goBack}>
                <ArrowLeft size={20} />
              </button>
            )}
          </div>
          {isRoot && (
            <>
              <div className="mobile-header-title mobile-header-title-truncate">Items</div>
              <div className="mobile-header-end w-12" />
            </>
          )}
        </MobileHeader>
      )}
      <div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
        <PageNavPanel id="list" className="w-80 border-r border-line">
          <ItemList onSelect={(item) => { if (isMobile) goTo('detail'); }} />
        </PageNavPanel>
        <PageNavPanel id="detail" className="flex-1">
          <ItemDetail />
        </PageNavPanel>
      </div>
    </>
  )}
</PageNav>
```

Root page: bordered header with centered title and balancing spacer. Child page: just the back button, no title, no border.

## Routed Usage (search params)

Selection lives in URL search params. Survives refresh. See `src/example/pages/PageNavPage.tsx`.

Key patterns:
1. Read selection from `useSearchParams`, not local state.
2. Set `defaultPanel` based on whether a param exists on mount.
3. Navigate to child: set search param + `goTo()`.
4. Go back: clear search param + `goBack()`.

## Key Layout Patterns

### Mobile panels container
Wrap `<PageNavPanel>` in a div with `className="pagenav-panels"` on mobile:
```tsx
<div className={isMobile ? 'pagenav-panels' : 'flex flex-1 min-h-0'}>
```

### Full-page layout
Use `className="h-dvh"` on `<PageNav>`. The `.pagenav` class is `flex flex-col` so header + panels stack vertically.

## CSS Variables

| Variable | Fallback | Description |
|----------|----------|-------------|
| `--color-pagenav-panel-bg` | `--color-bg` | Panel background (mobile) |

## Behavior Notes

- Nav stack resets when switching from mobile to desktop.
- `defaultPanel` deep-link builds the full stack from root so `isRoot`/`goBack` work correctly.
- All panels stay mounted — scroll position and form state preserved.
- Transition: `350ms cubic-bezier(0.32, 0.72, 0, 1)` (iOS-style).

## Examples

- `src/example/pages/PageNavPage.tsx` — Routed (search params)
- `src/example/pages/PageNavTablePage.tsx` — Non-routed (useState, DataTable)
- `src/example/pages/MobileHeaderPage.tsx` — Article 3 uses PageNav inside a MobileHeader child page
