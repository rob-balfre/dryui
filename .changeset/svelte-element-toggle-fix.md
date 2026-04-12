---
'@dryui/primitives': minor
'@dryui/ui': minor
---

Ban `<svelte:element this={x}>` anti-pattern across the library, fix Toggle misalignment, and simplify a few compound components.

**Breaking changes**

- `Card.Root`: dropped `'a'` from the `as` prop union. Only `'div'` (default) and `'button'` are supported. Replace `<Card.Root as="a" href="/foo">` with `<a href="/foo"><Card.Root>…</Card.Root></a>` or use an interactive card via `as="button"` + `onclick`.
- `LinkPreview.Trigger`: `href` is now required. Previously optional with no navigation target, which produced an invalid anchor at runtime.
- `PinInput`: renamed the cell state type from `PinInputCell` to `PinInputCellState` so it no longer collides with the `PinInput.Cell` component. The old type alias is removed — update imports from `import type { PinInputCell } from '@dryui/primitives'` to `import type { PinInputCellState } from '@dryui/primitives'`.

**Non-breaking changes**

- `Button`: added `--dry-btn-justify`, `--dry-btn-align`, and `--dry-btn-min-height` CSS custom properties so consumers (like `Toggle`) can override layout defaults without fighting the base styles.
- `Toggle`: thumb no longer overflows the track on the right edge. Root cause was `Button`'s hardcoded `justify-content: center` and `min-height: var(--dry-space-12)` — now variable-driven. Also fixed `--_thumb-travel` for `sm` and `md` sizes to subtract the 2px border width, matching the existing `lg` pattern.
- `MegaMenu.Link` and `Card.Root`: replaced `<svelte:element this={…}>` with explicit `{#if}/{:else}` branches rendering concrete `<button>` / `<a>` / `<div>` tags. Element-specific UA resets (appearance, background, border, font, text-align) now live in scoped styles so the rendered elements look correct regardless of which branch is taken.
- `PageHeader.Title`: unchanged — still `<svelte:element this={\`h${level}\`}>`for h1–h6. The new`dryui/no-svelte-element`lint rule exempts this via a`<!-- dryui-allow svelte-element -->` comment.
- Removed the unused internal `result-card-shell.svelte` (zero imports).
