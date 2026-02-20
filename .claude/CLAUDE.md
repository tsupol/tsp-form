# tsp-form

React UI component library using CSS variables (Tailwind 4 compatible). Personal library by Tsupol.

## Structure
- `src/components/` — React components (each with matching CSS in `src/styles/`)
- `src/context/` — React context providers (Modal, Snackbar)
- `src/example/` — Dev playground app with side menu navigation
- `index.ts` — Public exports. **All new components must be exported here.**

## Dev
- `npm run dev` — Vite dev server on port 3003
- `npm run build:lib` — Library build (tsc + webpack)

## Styling
- Components use plain CSS files with CSS custom properties, not Tailwind utility classes
- All component CSS in `src/styles/` is wrapped in `@layer components` so Tailwind utilities can override them
- Variable naming follows Tailwind v4 conventions: `--color-*`, `--spacing-*`, `--radius-*`, `--text-*`
- Component-specific customization uses `--{property}-{component}-*` variables with global fallbacks (e.g. `--color-pagination-bg` falls back to `--color-surface`)
- `src/example/example.css` defines the theme variables consumed by components

## Consumer Integration (Tailwind 4)
To use this library with Tailwind 4, the consumer must declare the CSS layer order **before** any component CSS loads. Add this to `index.html` `<head>`:
```html
<style>@layer theme, base, components, utilities;</style>
```
This ensures `@layer components` (library styles) sits between `base` (Tailwind preflight) and `utilities` (Tailwind classes), allowing utility overrides like `class="modal-footer p-0"`.

## Key Internal Components
These are used by other library components — changes to them have wider impact:
- `PopOver` — used by Select, InputDatePicker, InputDateRangePicker, SideMenuItems
- `Chevron` — used by Select, CollapsiblePanel, SideMenuItems
- `Checkmark` — used by Checkbox
- `Button` — used by DatePicker
- `Input` — used by InputDatePicker, InputDateRangePicker
- `Skeleton` — used by Select

## Example App Patterns
- `src/example/styles/typography.css` — `.heading-1`–`.heading-4`, `.text-muted`, `.text-small` utility classes
- `src/example/styles/layout.css` — `.card`, `.divider`, `.divider-sm` utility classes
- These are example-level CSS, not shipped with the library — they depend on theme variables from `example.css`
- Use `.heading-1` for page titles, `.heading-3` for section titles, `.text-muted` for descriptions
- Use `.card` instead of `border border-line bg-surface p-card rounded-lg`
- Do NOT use `ContentPanel` — it has been removed. Use `heading-3` + `card` directly instead.

## Scrollable Containers
- Use `.better-scroll` class on any scrollable container for styled thin scrollbars
- `.modal-content` already has thin scrollbar styles built in — no need to add `.better-scroll`
- `.hidden-scroll` hides the scrollbar while keeping scroll functionality

## Form Patterns
- Each field: `flex flex-col` (no gap) — label, input, and error message handle their own spacing
- Form container: use `grid gap-5` — the gap accommodates one-line errors without layout shift
- Use `FormErrorMessage` (from `FormErrorSignal.tsx`) placed after the input — renders nothing when no error, one-line errors fit within gap-5, multi-line errors shift layout
- Use `form-field-error` class on inputs for error border styling
- **Forms in modals**: `FormErrorMessage` renders nothing when there's no error, so the modal starts compact. When errors appear, they add height and can cause unexpected scrolling. Add `pb-7` to `.modal-content` to reserve bottom space for error messages (e.g. `<div className="modal-content grid gap-5 pb-7">`)

## Conventions
- Components are standalone `.tsx` files, styles in separate `.css` files
- `clsx` for conditional class names
- **No external icon libraries (e.g. lucide-react) in library components** (`src/components/`, `src/context/`). Lucide is only allowed in `src/example/`. Use inline SVG or the built-in `Chevron` component instead.
- Peer deps: `react`, `react-dom`, `react-hook-form`, `clsx` — not bundled
- No tests currently
