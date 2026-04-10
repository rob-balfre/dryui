---
name: dryui
description: 'Use when building UIs with DryUI (@dryui/ui) Svelte 5 components. Teaches correct patterns for compound components, theming, forms, and accessibility. Use MCP tools when available; fall back to CLI.'
---

# DryUI

Zero-dependency Svelte 5 components. All imports from `@dryui/ui`. Requires a theme CSS import. Svelte 5 runes only.

**Tradeoff:** These rules bias toward correctness over speed. For throwaway prototypes, use judgment.

## 1. Look Up Before You Write

**Never guess a component API. Always verify first.**

- Call `info` or `compose` before using any component for the first time
- Component APIs vary — `bind:value`, `bind:open`, `bind:checked` are NOT interchangeable
- Compound vs simple, required parts, available props — all differ per component
- If you skip the lookup, you'll write plausible-looking code that silently breaks

The test: can you point to an `info` or `compose` call for every component in your output?

## 2. Everything is Compound Until Proven Otherwise

**Use `.Root`. Always check.**

Most DryUI components are compound — they require `<Card.Root>`, not `<Card>`. The bare name silently fails or renders wrong. Assume compound; verify with `info`.

```svelte
<!-- Wrong -->
<Card>content</Card>
<!-- Right -->
<Card.Root>content</Card.Root>
```

Compound components include Accordion, Alert, AlertDialog, Breadcrumb, Calendar, Card, Carousel, Chart, ChipGroup, Collapsible, ColorPicker, Combobox, CommandPalette, ContextMenu, DataGrid, DateField, DatePicker, DateRangePicker, DescriptionList, Dialog, DragAndDrop, Drawer, DropdownMenu, Field, Fieldset, FileSelect, FileUpload, FlipCard, FloatButton, HoverCard, InputGroup, LinkPreview, List, Listbox, Map, MegaMenu, Menubar, MultiSelectCombobox, NavigationMenu, NotificationCenter, OptionSwatchGroup, Pagination, PinInput, Popover, RadioGroup, RangeCalendar, RichTextEditor, SegmentedControl, Select, Sidebar, Splitter, StarRating, Stepper, Table, TableOfContents, Tabs, TagsInput, Timeline, Toast, ToggleGroup, Toolbar, Tooltip, Tour, Transfer, Tree and Typography.

The test: every compound component in your markup uses `.Root`, and its parts are wrapped inside it. See `rules/compound-components.md` for the full list and parts reference.

## 3. Let the Theme Do Its Job

**Import it. Use its tokens. Don't fight it.**

- Import `@dryui/ui/themes/default.css` (and `dark.css`) before any component use
- Use `--dry-color-*` and `--dry-space-*` tokens — never hardcoded colors or spacing
- Don't add decorative CSS (gradients, shadows, colored borders) — the theme handles appearance
- Override semantic tokens (Tier 2) in `:root`, not component tokens (Tier 3)
- Prefer `<html class="theme-auto">` — use `data-theme="light|dark"` only for explicit overrides

```css
/* Wrong */
.card {
	background: #6366f1;
	color: white;
}

/* Right */
.card {
	background: var(--dry-color-fill-brand);
	color: var(--dry-color-text-strong);
}
```

The test: does your CSS contain zero hex colors, zero `rgb()` values, and zero inline styles?

## 4. Grid for Layout. Container for Width. @container for Responsive.

**Nothing else.**

- All layout is `display: grid` with `--dry-space-*` tokens in scoped `<style>`
- `Container` (simple component, no `.Root`) for constrained content width
- Use `@container` queries for responsive sizing — never `@media` for layout breakpoints
- No flexbox. No inline styles. No `width`/`min-width`/`max-width` properties

```svelte
<div class="layout">...</div>

<style>
	.layout {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
```

The test: grep your output for `display: flex`, `style=`, `@media` — all should return nothing.

## 5. Every Input Gets a Field.Root

**Accessibility isn't optional.**

- Wrap every form input in `Field.Root` with a `Label`
- Use `AlertDialog` (not `Dialog`) for destructive confirmations
- Add `aria-label` to every icon-only button
- Use `type="submit"` on primary form action buttons

```svelte
<!-- Wrong -->
<label>Email</label>
<Input bind:value={email} />

<!-- Right -->
<Field.Root>
	<Label>Email</Label>
	<Input bind:value={email} />
</Field.Root>
```

The test: every `<Input>`, `<Select.Root>`, `<Textarea>` is inside a `Field.Root` with a `Label` sibling.

## 6. Prefer DryUI Over Native HTML

**If a DryUI component exists for it, use it.**

`DatePicker` not `<input type="date">`. `Select.Root` not `<select>`. `Dialog.Root` not `<dialog>`. `Separator` not `<hr>`. `Button` not `<button>`. DryUI components handle theming and accessibility automatically — native elements don't.

The test: search your markup for raw `<input`, `<select>`, `<dialog>`, `<button>`, `<hr>`, `<table>` — each should be a DryUI component instead.

## Quick Start

**1. Install this skill** — you're reading it, so it's already loaded. This is the most important step.

**2. Add the MCP server** for live API lookup and code validation:

- Claude Code: `claude plugin marketplace add rob-balfre/dryui && claude plugin install dryui@dryui` (installs skill + MCP in one step)
- Codex: public install today is `$skill-installer install https://github.com/rob-balfre/dryui/tree/main/packages/ui/skills/dryui` then `codex mcp add dryui -- npx -y @dryui/mcp`. If you're working inside the DryUI repo itself, install the repo-local plugin from `/plugins` via `.agents/plugins/marketplace.json`.
- Copilot/Cursor/Windsurf: `npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui` + add MCP config (see https://dryui.dev/tools)

**3. Bootstrap the project** — `init` detects your project state and applies whatever is missing:

```
npx -y @dryui/cli init
```

**New project from scratch?** Pass a directory name to scaffold SvelteKit + DryUI in one step:

```
npx -y @dryui/cli init my-app
cd my-app && npm run dev
```

This works for greenfield (empty directory), brownfield (existing non-SvelteKit project), and existing SvelteKit projects. Verify: `npx -y @dryui/cli detect --toon` — output should show `project: ready`.

### Manual setup

1. `bun add @dryui/ui`
2. Add `class="theme-auto"` to `<html>` in `src/app.html`
3. In root layout (`src/routes/+layout.svelte`), import themes:
   ```svelte
   <script>
   	import '@dryui/ui/themes/default.css';
   	import '@dryui/ui/themes/dark.css';
   </script>
   ```
4. Import `app.css` AFTER theme CSS if you have custom styles

## Bindable Props — Common Confusion

Always verify with `info`, but these are the most common mistakes:

- `bind:value` (Input, Select, Tabs...) vs `bind:checked` (Checkbox, Switch) vs `bind:pressed` (Toggle) vs `bind:open` (Dialog, Popover, Drawer...)
- Select and Combobox support both `bind:value` and `bind:open`
- ColorPicker also exposes `bind:alpha`; Transfer uses `bind:sourceItems` / `bind:targetItems`
- Tour uses `bind:active`, not `bind:open`

## Tools

Use these to look up APIs, discover components, plan setup, and validate code.

### Recommended workflow

1. `compose` or `info` before writing components so you confirm kind, required parts, bindables, and canonical usage.
2. Build the route or component with raw CSS grid, `Container` for constrained width, and `@container` for responsive layout.
3. `review` or `doctor` after implementation to catch composition drift, layout violations, and accessibility regressions.
4. Never guess component shape from memory. DryUI is intentionally strict, and the lookup cost is lower than rework.

### MCP tools (preferred)

| Workflow             | Tools                                        |
| -------------------- | -------------------------------------------- |
| Project setup        | `detect_project`, `plan_install`, `plan_add` |
| Lookup & composition | `info`, `get`, `list`, `compose`             |
| Validation           | `review`, `diagnose`                         |
| Audit                | `doctor`, `lint`                             |

### CLI fallback

All commands support `--toon` for token-optimized agent output and `--full` to disable truncation.

```bash
bunx @dryui/cli init [path] [--pm bun]   # Bootstrap SvelteKit + DryUI project
bunx @dryui/cli info <component> --toon  # Look up component API
bunx @dryui/cli compose "date input" --toon  # Composition guidance
bunx @dryui/cli detect [path] --toon     # Check project setup
bunx @dryui/cli install [path] --toon    # Print install plan
bunx @dryui/cli review <file.svelte> --toon  # Validate component
bunx @dryui/cli diagnose <file.css> --toon   # Validate theme CSS
bunx @dryui/cli doctor [path] --toon     # Audit workspace
bunx @dryui/cli lint [path] --toon       # Deterministic findings
bunx @dryui/cli list --toon              # List components
```

Categories: action, input, form, layout, navigation, overlay, display, feedback, interaction, utility

## Rule Files

Read these when you need deeper guidance:

- **`rules/compound-components.md`** — Parts lists, component selection table, common mistakes
- **`rules/theming.md`** — Three-tier token system, dark mode, palette customization
- **`rules/composition.md`** — Form patterns, page layouts, composition recipes
- **`rules/accessibility.md`** — Field.Root, ARIA, focus management, pre-ship checklist
- **`rules/svelte.md`** — Runes, snippets, native browser APIs, styling rules
- **`rules/design.md`** — Minimal code, no premature abstraction, naming conventions
- **`rules/native-web-transitions.md`** — View Transition API, scroll animations, reduced-motion

---

**These rules are working if:** every component traces to a lookup, diffs contain zero hardcoded colors, and the reviewer finds nothing.
