---
name: dryui
description: 'Use when building UIs with DryUI (@dryui/ui) Svelte 5 components. Teaches correct patterns for compound components, theming, forms, and accessibility. Use MCP tools when available; fall back to CLI.'
---

# DryUI

## Overview

DryUI is a library of zero-dependency Svelte 5 components. All components import from `@dryui/ui`. Components are headless primitives with styled defaults via CSS modules and `--dry-*` CSS variables. A theme import is required for components to render correctly.

Key facts:

- Svelte 5 runes only (`$state`, `$derived`, `$props`) -- no legacy syntax
- Requires theme: `import '@dryui/ui/themes/default.css'` (or `dark.css`)
- Prefer `<html class="theme-auto">` as the default theme mode; only set `data-theme="light|dark"` for explicit overrides
- No external runtime dependencies

## Quick Start (new SvelteKit project)

Run the install planner — it detects the project and returns a tailored
step-by-step plan:

```
npx -y @dryui/cli install --json
```

Execute each `"pending"` step in the returned JSON (install package, edit/create
files). Then verify:

```
npx -y @dryui/cli detect --json
```

The output should show `"status": "ready"`.

### Manual setup (if you prefer)

1. `bun add @dryui/ui` (or npm/pnpm/yarn equivalent)
2. In `src/app.html`, add `class="theme-auto"` to the `<html>` tag (preserving
   existing attributes like `lang="en"`)
3. In your root layout (`src/routes/+layout.svelte`), add theme imports to the
   existing `<script>` block — do not create a second `<script>`:
   ```svelte
   <script>
   	import '@dryui/ui/themes/default.css';
   	import '@dryui/ui/themes/dark.css';
   </script>
   ```
4. Import `app.css` AFTER theme CSS if you have custom styles
5. (Optional) Override semantic tokens in `app.css` — use the layered token system documented in `rules/theming.md`

> **Local dev:** If `@dryui/ui` is not on npm, link from the monorepo:
> `cd /path/to/dryui/packages/ui && bun link && cd /your/project && bun link @dryui/ui`

## Critical Rules

### Rule 1: Compound components MUST use .Root

```svelte
<!-- Incorrect -->
<Card>content</Card>

<!-- Correct -->
<Card.Root>content</Card.Root>
```

Compound components include Accordion, Alert, AlertDialog, Breadcrumb, Calendar, Card, Carousel, Chart, ChipGroup, Collapsible, ColorPicker, Combobox, CommandPalette, ContextMenu, DataGrid, DateField, DatePicker, DateRangePicker, DescriptionList, Dialog, DragAndDrop, Drawer, DropdownMenu, Field, Fieldset, FileSelect, FileUpload, FlipCard, FloatButton, HoverCard, InputGroup, LinkPreview, List, Listbox, Map, MegaMenu, Menubar, MultiSelectCombobox, NavigationMenu, NotificationCenter, OptionSwatchGroup, Pagination, PinInput, Popover, RadioGroup, RangeCalendar, RichTextEditor, SegmentedControl, Select, Sidebar, Splitter, StarRating, Stepper, Table, TableOfContents, Tabs, TagsInput, Timeline, Toast, ToggleGroup, Toolbar, Tooltip, Tour, Transfer, Tree, and Typography. See `rules/compound-components.md` for parts lists.

### Rule 2: Always import a theme

```svelte
<script>
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';
	import { Button } from '@dryui/ui';
</script>
```

Without a theme, components render unstyled. See `rules/theming.md` for customization.

When building a theme toggle, default to system mode with `<html class="theme-auto">` and persist explicit user-selected `light` or `dark` overrides.

### Rule 3: Use the correct bind: prop — it varies by component

```svelte
<!-- Incorrect -->
<Input value={email} />
<Popover.Root bind:value={open} />
<!-- wrong prop -->

<!-- Correct -->
<Input bind:value={email} />
<Popover.Root bind:open />
```

Bindable props vary by component:

- `bind:value` — Input, Textarea, NumberInput, Slider, Rating, PinInput, Select, Combobox, Tabs, TagsInput, ColorPicker, DatePicker, RadioGroup, RichTextEditor, Accordion, ToggleGroup
- `bind:checked` — Checkbox, Switch
- `bind:pressed` — Toggle
- `bind:open` — Popover, Dialog, Drawer, AlertDialog, DropdownMenu, ContextMenu, Select, Combobox, CommandPalette, FloatButton, DatePicker, Collapsible
- `bind:active` — Tour (not `bind:open`)
- `bind:files` — FileUpload
- `bind:page` — Pagination
- `bind:activeStep` — Stepper
- `bind:sizes` — Splitter

Select and Combobox support both `bind:value` and `bind:open`. ColorPicker also exposes `bind:alpha`. Transfer uses `bind:sourceItems` and `bind:targetItems`.

### Rule 4: Use CSS grid for layout, Container for width

```svelte
<!-- Incorrect -->
<div style="display: flex; gap: 1rem;">...</div>

<!-- Correct — raw CSS grid in scoped <style> -->
<div class="layout">...</div>
<style>
  .layout { display: grid; gap: var(--dry-space-4); }
</style>
```

Use `display: grid` with `--dry-space-*` tokens for layout. Use `Container` for constrained content width. Use `@container` queries for responsive sizing — never `@media` for layout breakpoints. Do not use inline styles.

### Rule 5: Wrap form inputs in Field.Root

```svelte
<!-- Incorrect -->
<label>Email</label>
<Input bind:value={email} />

<!-- Correct -->
<Field.Root>
	<Label>Email</Label>
	<Input bind:value={email} />
</Field.Root>
```

See `rules/accessibility.md` for ARIA details.

### Rule 6: Use --dry-\* CSS variables, not hardcoded colors

```css
/* Incorrect */
.card {
	background: #6366f1;
	color: white;
}

/* Correct */
.card {
	background: var(--dry-color-fill-brand);
	color: var(--dry-color-text-strong);
}
```

See `rules/theming.md` for the full token system.

### Rule 7: Use DryUI components instead of native HTML equivalents

```svelte
<!-- Incorrect -->
<input type="date" bind:value={date} />
<select bind:value={choice}><option>...</option></select>
<dialog>...</dialog>

<!-- Correct -->
<DatePicker.Root bind:value={date}>
	<DatePicker.Trigger>Pick a date</DatePicker.Trigger>
	<DatePicker.Content>
		<DatePicker.Calendar />
	</DatePicker.Content>
</DatePicker.Root>

<Select.Root bind:value={choice}>
	<Select.Trigger />
	<Select.Content>
		<Select.Item value="a">Option A</Select.Item>
	</Select.Content>
</Select.Root>

<Dialog.Root>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Content>...</Dialog.Content>
</Dialog.Root>
```

DryUI provides themed, accessible replacements for native `<input type="date">`, `<select>`, `<dialog>`, and other HTML elements. Always prefer the DryUI component — it integrates with the theme system, provides consistent styling, and handles accessibility automatically. Look up the component with `info` before first use.

### Rule 8: Don't add decorative styling — output clean components

When generating layouts or composing components, do NOT add decorative CSS such as gradients, box-shadows, rounded corners, colored left borders, background effects, or other visual embellishments. Output the components with their props and let the theme handle appearance.

```svelte
<!-- Incorrect: decorative CSS baked in -->
<div
	style="background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
>
	<Card.Root>...</Card.Root>
</div>

<!-- Incorrect: wrapper with decorative class -->
<div class="fancy-card">
	<Card.Root>...</Card.Root>
</div>

<!-- Correct: just the component -->
<Card.Root>
	<Card.Content>
		<Text>Clean output</Text>
	</Card.Content>
</Card.Root>

<style>
	.fancy-card {
		background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.18), transparent);
		border-left: 3px solid var(--dry-color-stroke-brand);
	}
</style>
```

The component library handles styling through CSS modules and `--dry-*` tokens. Adding decorative CSS on top creates visual inconsistency and fights the theme system. If the user wants custom visuals, they'll ask for them or apply them separately.

### Rule 9: Check composition before writing UI

Before generating any DryUI layout or component composition, call `compose` with a description of what you're building. This ensures you use the correct components and avoid anti-patterns.

Workflow:

1. Identify each distinct UI element you need (date input, image placeholder, progress stepper, etc.)
2. Call `compose` for each one — MCP: `compose({ query: "date input" })`, CLI: `bunx @dryui/cli compose "date input"`
3. Use the top-ranked component from the result
4. Follow the snippet patterns exactly
5. After writing, call `review` to validate

Never skip this step. The compose tool exists because component selection mistakes (like using `<Input type="date">` instead of `DatePicker`) are invisible until someone sees the broken output.

### 10. Always create a thumbnail when adding a new component

Run `bun run thumbnail:create <Name>` and customize the SVG markup in `packages/ui/src/thumbnail/<name>.svelte`. The MCP reviewer will flag components without thumbnails.

## Tool Usage

Use these tools to look up component APIs, discover components, plan project setup, and validate code. **Always look up a component before using it for the first time.**

### MCP tools (preferred when available)

When the DryUI MCP server is installed, use the live inventory published in the docs AI surface pages. The tools group into four workflows:

- Project setup and adoption planning: `detect_project`, `plan_install`, `plan_add`
- Lookup and composition: `info`, `get`, `list`, `compose`
- Validation and theme checks: `review`, `diagnose`
- Repo audit: `doctor`, `lint`

Example calls:

```ts
detect_project({ cwd: '.' });
plan_install({ cwd: '.' });
plan_add({ name: 'Card', cwd: '.', subpath: true });
info({ name: 'Card' });
```

### CLI fallback (when MCP is not installed)

If the MCP server is not available, use the CLI instead:

```bash
bunx @dryui/cli detect [path]     # Detect DryUI project setup
bunx @dryui/cli install [path]    # Print the install plan
bunx @dryui/cli add --project Card # Print a project-aware add plan
bunx @dryui/cli info <component>    # Look up component API
bunx @dryui/cli get "<name>"         # Retrieve composed output source
bunx @dryui/cli list [--category]   # Discover components
bunx @dryui/cli review <file.svelte> # Validate Svelte component
bunx @dryui/cli compose "date input" # Look up composition guidance
bunx @dryui/cli diagnose <file.css>  # Validate theme CSS
bunx @dryui/cli doctor [path]        # Audit workspace health
bunx @dryui/cli lint [path]          # Print deterministic workspace findings
```

Categories: action, input, form, layout, navigation, overlay, display, feedback, interaction, utility

## Rule File Pointers

Read these files when you need deeper guidance on specific topics:

- **`rules/compound-components.md`** -- Read when building with Dialog, Tabs, Accordion, Select, or any compound component. Contains parts lists and correct usage patterns.
- **`rules/theming.md`** -- Read when setting up themes, customizing component styles, or fixing invisible/unstyled components.
- **`rules/composition.md`** -- Read when building page layouts or forms. Contains layout patterns and form composition recipes.
- **`rules/accessibility.md`** -- Read when handling form validation, focus management, ARIA attributes, or dialog patterns.
- **`rules/svelte.md`** -- Read when writing Svelte 5 components. Covers rune usage, snippets, compound components, native browser APIs, and styling rules.
- **`rules/design.md`** -- Read when writing or reviewing code. Enforces minimal, readable, correct code with no unnecessary abstractions.
- **`rules/native-web-transitions.md`** -- Read when adding animations or transitions. Covers View Transition API, scroll-driven animations, reduced-motion handling, and progressive enhancement.
