# Migration Guide

## Breaking Changes

### Button & Badge: Icons now use `startIcon` / `endIcon` props

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

Badge follows the same pattern:

**Before:**
```tsx
<Badge color="success"><Check /> Approved</Badge>
<Badge color="primary">Featured <Star /></Badge>
```

**After:**
```tsx
<Badge color="success" startIcon={<Check />}>Approved</Badge>
<Badge color="primary" endIcon={<Star />}>Featured</Badge>
```

### Icon-only auto-detect (Button & Badge)

No more `size="icon"` / `size="icon-sm"` etc. Just pass an icon with no children — it automatically becomes square.

**Before:**
```tsx
<Button size="icon" variant="outline"><Mail /></Button>
<Button size="icon-sm" color="primary"><Plus /></Button>
<Badge color="primary" size="icon"><Star /></Badge>
<Badge color="success" size="icon-sm"><Check /></Badge>
```

**After:**
```tsx
<Button variant="outline" startIcon={<Mail />} />
<Button size="sm" color="primary" startIcon={<Plus />} />
<Badge color="primary" startIcon={<Star />} />
<Badge color="success" size="sm" startIcon={<Check />} />
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
