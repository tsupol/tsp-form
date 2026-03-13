# SideMenuItems — `activePath` prop

## Problem
`activeItem` requires an exact key match, so dynamic routes like `/course/123` don't highlight.

## Solution
Pass `activePath` with the current URL pathname. The component finds the item whose `path` is the longest prefix match and highlights it (+ ancestors).

```tsx
import { SideMenuItems } from 'tsp-form';

// Before — manual key derivation
const activeKey = menuItems.find(i => i.path === location.pathname)?.key;
<SideMenuItems items={items} activeItem={activeKey} />

// After — automatic prefix matching
<SideMenuItems items={items} activePath={location.pathname} />
```

## Matching rules
- `/` only matches exactly (won't match `/buttons`)
- Other paths use `startsWith` — e.g. `/course` matches `/course/123/lesson/5`
- Longest match wins — `/course/123` beats `/course` for `/course/123/lesson/5`

## Backwards compatibility
`activeItem` still works and takes priority over `activePath` when both are provided.
