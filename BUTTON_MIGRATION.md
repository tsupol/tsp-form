# Button Migration Guide

## Breaking Changes

### Icons now use `startIcon` / `endIcon` props

Icons are no longer passed as children. Use the `startIcon` and `endIcon` props instead.

**Before:**
```tsx
<Button color="primary"><Mail /> Send</Button>
<Button variant="outline">Next <ChevronRight /></Button>
```

**After:**
```tsx
<Button color="primary" startIcon={<Mail />}>Send</Button>
<Button variant="outline" endIcon={<ChevronRight />}>Next</Button>
```

Both icons:
```tsx
<Button startIcon={<Upload />} endIcon={<ChevronDown />}>Upload</Button>
```

### Icon-only buttons auto-detect

No more `size="icon"` / `size="icon-sm"` etc. Just pass an icon with no children — the button automatically becomes square.

**Before:**
```tsx
<Button size="icon" variant="outline"><Mail /></Button>
<Button size="icon-sm" color="primary"><Plus /></Button>
<Button size="icon-lg" variant="ghost"><Settings /></Button>
```

**After:**
```tsx
<Button variant="outline" startIcon={<Mail />} />
<Button size="sm" color="primary" startIcon={<Plus />} />
<Button size="lg" variant="ghost" startIcon={<Settings />} />
```

### `width` / `height` props removed from Drawer

Drawer sizing is now done via Tailwind classes on `className`. This enables responsive sizing.

**Before:**
```tsx
<Drawer open={open} onClose={close} width="40rem">...</Drawer>
<Drawer open={open} onClose={close} side="bottom" height="60dvh">...</Drawer>
```

**After:**
```tsx
<Drawer open={open} onClose={close} className="w-160 max-sm:w-full">...</Drawer>
<Drawer open={open} onClose={close} side="bottom" className="h-[60dvh]">...</Drawer>
```

## New Features

### `truncate` prop

Prevents button text from wrapping to a second line — truncates with ellipsis instead.

```tsx
<Button truncate>Very long button label that should not wrap</Button>
```

### Icon spacing fix

Narrow icons (chevrons, arrows) may look visually loose. Use a negative margin on the icon to tighten:

```tsx
<Button variant="outline" endIcon={<ChevronRight className="-mr-1" />}>Next</Button>
<Button color="primary" startIcon={<Upload />} endIcon={<ChevronDown className="-mr-0.5" />}>Upload</Button>
```
