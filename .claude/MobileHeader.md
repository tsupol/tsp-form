# MobileHeader

Headless sticky header for mobile navigation. Consumer provides all content — library provides only the structural container and SideMenu toggle hiding.

Uses `--spacing-nav` for height (Tailwind 4 generates `h-nav`, `w-nav`, `top-nav` utilities). Default fallback: `3rem`.

## Exports

- `MobileHeader` — Sticky header container. Sets `data-mobile-header` on `<body>` to hide SideMenu's floating toggle.
- `ScrollReveal` — Fades in children when a sentinel element scrolls out of view. Useful for showing the page title in the header on scroll.

## CSS Classes

**Library classes** (from `src/styles/mobile-header.css`):

| Class | Description |
|-------|-------------|
| `.mobile-header` | Applied automatically. Sticky, flex, `height: var(--spacing-nav)`. No border by default. |
| `.mobile-header-title` | Flex-1 centered title area. Use with `.mobile-header-title-truncate` for ellipsis. |
| `.mobile-header-title-truncate` | Adds `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`. |
| `.mobile-header-start` | Left slot (flex, z-index above title, shrink-0). |
| `.mobile-header-end` | Right slot (margin-left: auto, z-index above title, shrink-0). |

**Consumer styling classes** (example in `src/example/styles/layout.css` — not shipped with library):

These use double-class selectors (`.mobile-header.mobile-header-*`) for specificity over the library's `@layer components` styles. When writing consumer CSS, always prefix with `.mobile-header`:

```css
.mobile-header.mobile-header-bordered {
    border-bottom: var(--spacing-line) solid var(--color-line);
}
.mobile-header.mobile-header-scrolled-shadow {
    background: linear-gradient(to bottom, var(--color-mobile-header-bg, var(--color-surface)) 80%, transparent) !important;
}
```

| Selector | Description |
|----------|-------------|
| `.mobile-header.mobile-header-bordered` | Adds bottom border. |
| `.mobile-header.mobile-header-scrolled-shadow` | Gradient background fading to transparent at bottom. |

Consumers style the header via Tailwind utilities or their own double-class CSS. The library intentionally ships no border, no shadow — these are consumer choices.

## Basic Usage

```tsx
import { MobileHeader } from 'tsp-form';

<MobileHeader className="mobile-header-bordered">
  <div className="mobile-header-start">
    <MyMenuToggle />
  </div>
  <div className="mobile-header-title mobile-header-title-truncate">
    Page Title
  </div>
  <div className="mobile-header-end">
    <MyActionButton />
  </div>
</MobileHeader>
```

To center the title when only one side has content, add an empty spacer on the opposite side:

```tsx
<MobileHeader className="mobile-header-bordered">
  <div className="mobile-header-start">
    <MyMenuToggle />
  </div>
  <div className="mobile-header-title mobile-header-title-truncate">Title</div>
  <div className="mobile-header-end w-12" />
</MobileHeader>
```

## ScrollReveal — Title on Scroll

Show the title in the header only after the user scrolls past the real title:

```tsx
import { MobileHeader, ScrollReveal } from 'tsp-form';

function MyPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  return (
    <>
      <MobileHeader>
        <div className="mobile-header-start"><MyBackButton /></div>
        <div className="mobile-header-title">
          <ScrollReveal sentinel={titleRef}>
            Long Article Title That Gets Truncated
          </ScrollReveal>
        </div>
      </MobileHeader>
      <div>
        <h1 ref={titleRef}>Long Article Title That Gets Truncated</h1>
        <p>Content...</p>
      </div>
    </>
  );
}
```

ScrollReveal handles truncation internally (`display: block; overflow: hidden; text-overflow: ellipsis`). Do NOT add `.mobile-header-title-truncate` on the parent when using ScrollReveal — it causes an ellipsis ghost at opacity 0.

## Scroll Detection (useScrolled pattern)

For conditional border/shadow based on scroll position, use an IntersectionObserver on a zero-height sentinel at the top of the scrollable content. See `src/example/pages/MobileHeaderPage.tsx` for the full pattern.

## SideMenu Integration

MobileHeader sets `data-mobile-header` on `<body>`, hiding SideMenu's floating toggle. To let users open the side menu from the header:

```tsx
window.dispatchEvent(new CustomEvent('sidemenu:open'));
```

## CSS Variables

| Variable | Fallback | Description |
|----------|----------|-------------|
| `--spacing-nav` | `3rem` | Header height |
| `--color-mobile-header-bg` | `--color-surface` | Header background |

## Examples

- `src/example/pages/MobileHeaderPage.tsx` — Route-based parent/child pages with slide transitions, ScrollReveal title, scroll-based border/shadow
- `src/example/pages/PageNavPage.tsx` — PageNav with MobileHeader (routed)
- `src/example/pages/PageNavTablePage.tsx` — PageNav with MobileHeader (non-routed, DataTable)
