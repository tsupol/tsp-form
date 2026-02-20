# tsp-form Migration Guide

Migration from the DataTable release (d4f20e6) to current HEAD.
The library source is at `C:\Users\tonsu\PhpstormProjects\tsp-form` — read files there directly for reference.

## 1. REQUIRED: CSS Layer Order

All component CSS is now wrapped in `@layer components`. Add this to your `index.html` `<head>` **before** any stylesheets:

```html
<style>@layer theme, base, components, utilities;</style>
```

Without this, Tailwind utility classes won't override library styles.

## 2. Removed Exports

### FormControlError — REMOVED
Replace with `form-field-error` class + `FormErrorMessage`:

```tsx
// Before
import { FormControlError } from 'tsp-form';
<FormControlError error={errors.name}>
  <input {...register('name')} />
</FormControlError>

// After
import { FormErrorMessage } from 'tsp-form';
<input className={`form-control ${errors.name ? 'form-field-error' : ''}`} {...register('name')} />
<FormErrorMessage error={errors.name} />
```

### ModalWrapper — REMOVED
Replace with `Modal` + CSS utility classes:

```tsx
// Before
import { ModalWrapper } from 'tsp-form';
<ModalWrapper isOpen={open} onClose={onClose} title="Title" footer={<Button>Save</Button>}>
  Content
</ModalWrapper>

// After
import { Modal } from 'tsp-form';
<Modal open={open} onClose={onClose}>
  <div className="modal-header">
    <h2 className="modal-title">Title</h2>
    <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">×</button>
  </div>
  <div className="modal-content">Content</div>
  <div className="modal-footer"><Button>Save</Button></div>
</Modal>
```

Note: `ModalWrapper` used `isOpen` — `Modal` uses `open`.

## 3. Renamed Props

### DataTable: `size` → `controlSize`
```tsx
// Before
<DataTable size="md" />

// After
<DataTable controlSize="sm" />
```
- Now accepts `'xs' | 'sm' | 'md' | 'lg'` (added `xs`)
- Default changed from `'md'` to `'sm'`

## 4. Changed APIs

### FormErrorMessage: `reserveSpace` removed
`reserveSpace` prop is removed. It now renders nothing when there's no error (previously reserved space by default with `&nbsp;`).

```tsx
// Before — rendered invisible spacer when no error
<FormErrorMessage error={errors.name} reserveSpace={true} />

// After — renders null when no error
<FormErrorMessage error={errors.name} />
```

**Form layout pattern:** Use `grid gap-5` on the form container. The gap accommodates one-line errors without layout shift.

**Forms in modals:** Add `pb-7` to `.modal-content` to reserve space for errors:
```tsx
<div className="modal-content grid gap-5 pb-7">
```

## 5. Modal CSS Utilities (New)

These classes are now available for building modal layouts:
- `.modal-header` — flex row with space-between, border-bottom
- `.modal-title` — h2 styling
- `.modal-close-btn` — × button (enlarged hit area spanning header height)
- `.modal-content` — scrollable flex area with thin scrollbar
- `.modal-footer` — flex row, right-aligned, border-top

## 6. New Components

### Badge
```tsx
import { Badge } from 'tsp-form';
<Badge color="primary" variant="solid" size="md">Label</Badge>
```
Props: `color`, `variant` (`'solid' | 'outline'`), `size` (`'xs' | 'sm' | 'md' | 'lg'`), `truncate`

### Button Enhancements
- Icon support: place SVG inside Button, auto-sized
- New size classes: `.btn-xs`, `.btn-icon`, `.btn-icon-xs`, `.btn-icon-sm`, `.btn-icon-lg`
- `btn-md` class no longer emitted (it's the default)

## 7. Search Patterns for Migration

Find usages to update in the consumer codebase:

| Search for | Replace with |
|---|---|
| `FormControlError` | `FormErrorMessage` + `form-field-error` class |
| `ModalWrapper` | `Modal` with `.modal-header/.content/.footer` |
| `reserveSpace` | Remove prop |
| `<DataTable` ... `size=` | Change to `controlSize=` |
| `isOpen={` on Modal/ModalWrapper | Change to `open={` (if using ModalWrapper) |

## Reference

- Library source: `C:\Users\tonsu\PhpstormProjects\tsp-form`
- Component code: `src/components/`
- CSS: `src/styles/`
- Example usage: `src/example/`
- Exports: `index.ts`
