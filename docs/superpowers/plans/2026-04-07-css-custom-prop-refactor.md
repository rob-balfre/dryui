# CSS Custom Property Refactor — Eliminate Cross-Component Selectors

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all CSS selectors that target elements in other components (`:has()`, ancestor selectors, snippet child selectors) with CSS custom property contracts — parent sets vars, children consume them in their own scoped styles.

**Architecture:** Each component styles ONLY elements it directly renders. Cross-component layout coordination uses `--dry-*` CSS custom properties that inherit down the DOM tree. Context is used only when children need JS state from parents (e.g. orientation, open state) — CSS vars handle the styling contract.

**Tech Stack:** Svelte 5, CSS custom properties, `data-*` attribute selectors, scoped `<style>` blocks.

**Validation:** After each task, run `bun run --filter '@dryui/ui' build` to verify no lint or build errors. After all tasks, run `bun run validate --no-test` for the full pipeline.

**Rule:** Never use `:global()`, `svelte-ignore css_unused_selector`, or inline `style` attributes. Never add `width`/`inline-size` properties. All layout is CSS grid.

---

## File Map

### Pattern A — `:has()` to CSS custom props (2 components)

| Parent (modify)                                    | Children (modify)                         | What changes                                                                                                   |
| -------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/alert/alert-root.svelte`          | `alert-icon.svelte`, `alert-close.svelte` | Remove `:has()` grid selectors; use always-3-column grid; children own their gap spacing via `--dry-alert-gap` |
| `packages/ui/src/button-group/button-group.svelte` | _(none — CSS-only fix)_                   | Replace `> :where(span):has(:hover)` with `> :where(span):hover` (CSS `:has()` not needed here)                |

### Pattern B — Ancestor selectors to CSS custom props (4 components)

| Component (modify)                                         | Parent that sets vars (modify)     | What changes                                                                                |
| ---------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `packages/ui/src/tabs/tabs-trigger.svelte`                 | `tabs-root.svelte`                 | Root sets `--dry-tabs-trigger-border-*` vars per orientation; trigger consumes them         |
| `packages/ui/src/float-button/float-button-action.svelte`  | _(self — remove wrapper selector)_ | Restyle: remove `[data-float-button-action-wrapper]` prefix, target own `<button>` directly |
| `packages/ui/src/float-button/float-button-root.svelte`    | _(self)_                           | Remove wrapper prefix selectors; target own rendered div directly                           |
| `packages/ui/src/float-button/float-button-trigger.svelte` | _(self)_                           | Remove wrapper prefix selectors; target own `<button>` directly via data-attr               |

### Pattern C — Snippet child selectors to CSS custom props (5 components)

| Parent (modify)                                                       | Children (modify)                                                                                                                               | What changes                                                                                               |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/field/field-root.svelte`                             | `packages/ui/src/label/label.svelte`                                                                                                            | Root sets `--dry-field-label-order` / `--dry-field-content-order`; Label consumes order var                |
| `packages/ui/src/flip-card/flip-card-root.svelte`                     | `flip-card-front.svelte`, `flip-card-back.svelte`                                                                                               | Root sets `--dry-flip-card-front-transform` / `--dry-flip-card-back-transform` per state; children consume |
| `packages/ui/src/navigation-menu/navigation-menu-list.svelte`         | `navigation-menu-item.svelte`                                                                                                                   | Root sets `--dry-nav-item-position: relative`; item consumes it                                            |
| `packages/ui/src/notification-center/notification-center-root.svelte` | `notification-center-panel.svelte`, `notification-center-item.svelte`, `notification-center-group.svelte`, `notification-center-trigger.svelte` | Move ALL child selectors to their respective child components                                              |
| `packages/ui/src/range-calendar/range-calendar-root.svelte`           | `range-calendar-grid.svelte` _(or equivalent)_                                                                                                  | Move grid/row/cell styles to the child that renders them; root keeps only root-level tokens                |

### Special case — Legitimate `:global` (1 component)

| Component                                                    | Why `:global` is correct                                                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ui/src/markdown-renderer/markdown-renderer.svelte` | Renders HTML elements via `{@render}` snippet — exactly the pattern Svelte docs prescribe `:global` for. Use `.root :global { h1 {...} }` scoped block. |

### Ancestor theme selectors (2 components)

| Component                    | What changes                                                                                                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `map-root.svelte`            | Remove `[data-theme='dark']` ancestor selector; dark-mode token overrides already handled by semantic token system (`--dry-color-bg-raised` etc.) — delete the override block if redundant, or use `@media (prefers-color-scheme: dark)` |
| `range-calendar-root.svelte` | Same — delete `[data-theme='dark']` block; semantic tokens handle it. Keep the `@media (prefers-color-scheme)` block.                                                                                                                    |

### No changes needed (confirmed false positives, 13 files)

These had `svelte-ignore` unnecessarily — all selectors target elements rendered directly in the component:

`combobox-group`, `multi-select-combobox-group`, `date-range-picker-root`, `dialog-footer`, `file-upload-root`, `list-root`, `radio-group`, `shader-canvas`, `sidebar-trigger`, `system-map`, `virtual-list`, `FollowUpQuestionCard`, `WizardShell`

---

## Task 1: Alert — Remove `:has()`, use always-3-column grid

**Files:**

- Modify: `packages/ui/src/alert/alert-root.svelte`
- Modify: `packages/ui/src/alert/alert-icon.svelte`
- Modify: `packages/ui/src/alert/alert-close.svelte`

- [ ] **Step 1: Modify alert-root.svelte — replace `:has()` grid with always-3-column**

In the `<style>` block, replace:

```css
[data-alert] {
	/* ... keep all existing properties except: */
	grid-template-columns: 1fr;
	column-gap: var(--dry-alert-gap, var(--dry-space-3));
}

/* DELETE these three rules entirely: */
[data-alert]:has([data-alert-icon]) {
	grid-template-columns: auto 1fr;
}
[data-alert]:has([data-alert-close]) {
	grid-template-columns: 1fr auto;
}
[data-alert]:has([data-alert-icon]):has([data-alert-close]) {
	grid-template-columns: auto 1fr auto;
}
```

With:

```css
[data-alert] {
	/* ... keep all existing properties, but change: */
	grid-template-columns: auto 1fr auto;
	column-gap: 0;
}
```

Also update the responsive block — change `column-gap` to `0`:

```css
@container (max-width: 640px) {
	[data-alert] {
		padding: var(--dry-alert-padding, var(--dry-space-3));
	}
}
```

- [ ] **Step 2: Modify alert-icon.svelte — add gap spacing**

Add to the existing `[data-alert-icon]` style rule:

```css
[data-alert-icon] {
	/* ...keep existing styles... */
	padding-inline-end: var(--dry-alert-gap, var(--dry-space-3));
}
```

- [ ] **Step 3: Modify alert-close.svelte — add gap spacing**

Add to the existing `[data-alert-close]` style rule:

```css
[data-alert-close] {
	/* ...keep existing styles... */
	padding-inline-start: var(--dry-alert-gap, var(--dry-space-3));
}
```

- [ ] **Step 4: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

Expected: exit code 0, no warnings.

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/alert/
git commit -m "refactor(alert): replace :has() selectors with always-3-column grid and child-owned spacing"
```

---

## Task 2: Button Group — Replace `:has()` with direct selectors

**Files:**

- Modify: `packages/ui/src/button-group/button-group.svelte`

- [ ] **Step 1: Replace `:has(:hover)` and `:has(:focus-visible)` selectors**

In both the horizontal and vertical orientation blocks, replace:

```css
& > :where(button, a):hover,
& > :where(button, a):focus-visible,
& > :where(span):has(:hover) > :where(button, a),
& > :where(span):has(:focus-visible) > :where(button, a) {
	z-index: var(--dry-button-group-hover-z-index);
	position: relative;
}
```

With:

```css
& > :where(button, a):hover,
& > :where(button, a):focus-visible,
& > :where(span):hover > :where(button, a),
& > :where(span):focus-within > :where(button, a) {
	z-index: var(--dry-button-group-hover-z-index);
	position: relative;
}
```

`:hover` on the span itself propagates from child hover. `:focus-within` replaces `:has(:focus-visible)` and is well-supported.

- [ ] **Step 2: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/button-group/
git commit -m "refactor(button-group): replace :has() with :hover and :focus-within"
```

---

## Task 3: Tabs Trigger — Orientation via CSS custom props

**Files:**

- Modify: `packages/ui/src/tabs/tabs-root.svelte`
- Modify: `packages/ui/src/tabs/tabs-trigger.svelte`

- [ ] **Step 1: Add orientation CSS vars to tabs-root.svelte**

In the `<style>` block of tabs-root, add to the existing `[data-tabs-root]` (or equivalent) rule:

```css
[data-tabs-root] {
	/* existing styles... */
	--dry-tabs-trigger-border-bottom: 4px solid transparent;
	--dry-tabs-trigger-border-right: none;
	--dry-tabs-trigger-active-border-bottom-color: var(--dry-color-stroke-selected);
	--dry-tabs-trigger-active-border-right-color: transparent;
}

[data-tabs-root][data-orientation='vertical'] {
	/* existing styles... */
	--dry-tabs-trigger-border-bottom: none;
	--dry-tabs-trigger-border-right: 4px solid transparent;
	--dry-tabs-trigger-active-border-bottom-color: transparent;
	--dry-tabs-trigger-active-border-right-color: var(--dry-color-stroke-selected);
}
```

- [ ] **Step 2: Update tabs-trigger.svelte — consume orientation vars**

In the `<style>` block, replace the hardcoded border values and delete the ancestor selectors:

Change in `[data-tabs-trigger]`:

```css
[data-tabs-trigger] {
	/* ...keep all existing, but change: */
	border-bottom: var(--dry-tabs-trigger-border-bottom, 4px solid transparent);
	border-right: var(--dry-tabs-trigger-border-right, none);
}
```

Change in `[data-tabs-trigger][data-state='active']`:

```css
[data-tabs-trigger][data-state='active'] {
	color: var(--dry-color-text-brand);
	border-bottom-color: var(
		--dry-tabs-trigger-active-border-bottom-color,
		var(--dry-color-stroke-selected)
	);
	border-right-color: var(--dry-tabs-trigger-active-border-right-color, transparent);
	font-weight: 600;
}
```

**DELETE** these two rules entirely:

```css
[data-orientation='vertical'] [data-tabs-trigger] { ... }
[data-orientation='vertical'] [data-tabs-trigger][data-state='active'] { ... }
```

- [ ] **Step 3: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/tabs/
git commit -m "refactor(tabs): replace ancestor orientation selector with CSS custom props"
```

---

## Task 4: Float Button — Remove wrapper prefix selectors

**Files:**

- Modify: `packages/ui/src/float-button/float-button-action.svelte`
- Modify: `packages/ui/src/float-button/float-button-root.svelte`
- Modify: `packages/ui/src/float-button/float-button-trigger.svelte`

- [ ] **Step 1: Fix float-button-action.svelte**

The component renders a `<button>` directly. Replace all `[data-float-button-action-wrapper] :where(button)` selectors with `[data-float-button-action]` targeting the button directly.

Add `data-float-button-action` to the template `<button>`:

```svelte
<button
	type="button"
	data-float-button-action
	data-state={ctx.open ? 'open' : 'closed'}
	...
```

In the style block, replace `[data-float-button-action-wrapper] :where(button)` with `[data-float-button-action]`. Delete the `[data-float-button-action-wrapper] { display: contents; }` rule.

- [ ] **Step 2: Fix float-button-root.svelte**

Add `data-float-button` to the template div:

```svelte
<div data-float-button data-state={open ? 'open' : 'closed'} ...>
```

Replace `[data-float-button-wrapper] :where([data-float-button])` with `[data-float-button]`. Delete the `[data-float-button-wrapper] { display: contents; }` rule. Replace `[data-float-button-wrapper][data-position='bottom-right'] :where([data-float-button])` with `[data-float-button][data-position='bottom-right']` — also add `data-position={position}` to the template.

- [ ] **Step 3: Fix float-button-trigger.svelte**

Add `data-float-button-trigger` to the template `<button>` (it may already exist). Replace `[data-float-button-trigger-wrapper] :where(button)` with `[data-float-button-trigger]`. Delete wrapper rules. Replace size selectors `[data-float-button-trigger-wrapper][data-size='sm'] :where(button)` with `[data-float-button-trigger][data-size='sm']` — add `data-size={size}` to the template button if not present.

- [ ] **Step 4: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/float-button/
git commit -m "refactor(float-button): remove wrapper prefix selectors, target own elements directly"
```

---

## Task 5: Field Root — Child ordering via CSS custom props

**Files:**

- Modify: `packages/ui/src/field/field-root.svelte`
- Modify: `packages/ui/src/label/label.svelte`

- [ ] **Step 1: Update field-root.svelte — set order vars, remove child selectors**

Replace the child-targeting selectors:

```css
[data-field] {
	--dry-field-gap: var(--dry-space-1_5);
	--dry-field-label-order: 1;
	--dry-field-content-order: 4;
	display: grid;
	gap: var(--dry-field-gap);

	&[data-disabled] {
		opacity: 0.5;
	}

	&[data-error] {
		--dry-field-gap: var(--dry-space-1);
	}
}
```

**DELETE** these two rules:

```css
& > :where(:not(label)) {
	order: 4;
}
& > :where(label) {
	order: 1;
}
```

- [ ] **Step 2: Update label.svelte — consume order var**

Add to the existing `label` style rule:

```css
label {
	/* ...keep existing styles... */
	order: var(--dry-field-label-order, unset);
}
```

- [ ] **Step 3: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/field/ packages/ui/src/label/
git commit -m "refactor(field): replace child order selectors with CSS custom props"
```

---

## Task 6: Flip Card — Transform via CSS custom props

**Files:**

- Modify: `packages/ui/src/flip-card/flip-card-root.svelte`
- Modify: `packages/ui/src/flip-card/flip-card-front.svelte`
- Modify: `packages/ui/src/flip-card/flip-card-back.svelte`

- [ ] **Step 1: Update flip-card-root.svelte — set transform vars, remove child selectors**

Keep only root-level styles and set CSS vars for children:

```css
[data-flip-card] {
	--dry-flip-card-duration: 0.6s;
	--dry-flip-card-perspective: 1000px;
	--dry-flip-card-front-transform: rotateY(0deg);
	--dry-flip-card-back-transform: rotateY(180deg);

	perspective: var(--dry-flip-card-perspective);
	position: relative;
}

[data-flip-card][data-direction='horizontal'][data-flipped] {
	--dry-flip-card-front-transform: rotateY(180deg);
	--dry-flip-card-back-transform: rotateY(360deg);
}

[data-flip-card][data-direction='vertical'] {
	--dry-flip-card-front-transform: rotateX(0deg);
	--dry-flip-card-back-transform: rotateX(180deg);
}

[data-flip-card][data-direction='vertical'][data-flipped] {
	--dry-flip-card-front-transform: rotateX(180deg);
	--dry-flip-card-back-transform: rotateX(360deg);
}
```

**DELETE** all `[data-flip-card] > :where([data-part='front'])` and `[data-flip-card] > :where([data-part='back'])` rules.

- [ ] **Step 2: Update flip-card-front.svelte — consume transform var**

Add/replace styles:

```css
[data-flip-card-front] {
	z-index: 2;
	backface-visibility: hidden;
	transition: transform var(--dry-flip-card-duration, 0.6s) ease;
	position: absolute;
	inset: 0;
	transform: var(--dry-flip-card-front-transform, rotateY(0deg));
}
```

- [ ] **Step 3: Update flip-card-back.svelte — consume transform var**

Add/replace styles:

```css
[data-flip-card-back] {
	z-index: 1;
	backface-visibility: hidden;
	transition: transform var(--dry-flip-card-duration, 0.6s) ease;
	position: absolute;
	inset: 0;
	transform: var(--dry-flip-card-back-transform, rotateY(180deg));
}
```

- [ ] **Step 4: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/flip-card/
git commit -m "refactor(flip-card): replace child selectors with CSS custom prop transforms"
```

---

## Task 7: Navigation Menu List — Item position via CSS custom prop

**Files:**

- Modify: `packages/ui/src/navigation-menu/navigation-menu-list.svelte`
- Modify: `packages/ui/src/navigation-menu/navigation-menu-item.svelte`

- [ ] **Step 1: Update navigation-menu-list.svelte — remove child `li` selector**

**DELETE** this rule:

```css
[data-nav-menu-list] > :is(li) {
	position: relative;
}
```

- [ ] **Step 2: Update navigation-menu-item.svelte — add position**

Add to existing styles (or create style block):

```css
li {
	position: relative;
}
```

- [ ] **Step 3: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/navigation-menu/
git commit -m "refactor(navigation-menu): move li position to item component"
```

---

## Task 8: Notification Center — Move child styles to child components

**Files:**

- Modify: `packages/ui/src/notification-center/notification-center-root.svelte`
- Modify: `packages/ui/src/notification-center/notification-center-panel.svelte`
- Modify: `packages/ui/src/notification-center/notification-center-item.svelte`
- Modify: `packages/ui/src/notification-center/notification-center-group.svelte`
- Modify: `packages/ui/src/notification-center/notification-center-trigger.svelte`

- [ ] **Step 1: Identify which styles belong to which child**

Read each child component to confirm which `data-*` attribute it renders. Then move each CSS block from root to the component that renders the matching element.

- [ ] **Step 2: Move panel styles to notification-center-panel.svelte**

Move the entire `[data-notification-center-panel]` rule block (including `:popover-open`, `@starting-style`, transition) from root to panel. Also move the `[data-theme='dark'] [data-notification-center-panel]` rule — but convert it to use the semantic tokens directly (the dark theme tokens should already resolve correctly via the theme system; delete the override if redundant).

- [ ] **Step 3: Move item styles to notification-center-item.svelte**

Move all `[data-notification-center-item]` rules from root to item component.

- [ ] **Step 4: Move group styles to notification-center-group.svelte**

Move `[data-notification-center-group] [data-part='group-header']` to the group component.

- [ ] **Step 5: Move trigger styles to notification-center-trigger.svelte**

Move `[data-notification-center-trigger]` rule to trigger component.

- [ ] **Step 6: Clean up root — keep only root styles**

Root should only have:

```css
[data-notification-center-root] {
	position: relative;
	display: inline-grid;
}
```

Set any CSS vars on root that children need (e.g. `--dry-nc-item-padding`, `--dry-nc-unread-bg`).

- [ ] **Step 7: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/notification-center/
git commit -m "refactor(notification-center): colocate styles with child components"
```

---

## Task 9: Range Calendar — Move grid styles to grid child

**Files:**

- Modify: `packages/ui/src/range-calendar/range-calendar-root.svelte`
- Modify: `packages/ui/src/range-calendar/range-calendar-grid.svelte` (or equivalent child)

- [ ] **Step 1: Identify the child component that renders the calendar grid**

Read the range-calendar directory to find which component renders the `[data-range-calendar-grid]` element and the `[role='grid']`, `[role='row']`, `[role='gridcell']` elements.

- [ ] **Step 2: Move grid styles to the child component**

Move the entire `[data-range-calendar-grid]` block (with all nested role selectors) from root to the child component that renders those elements.

- [ ] **Step 3: Remove redundant `[data-theme='dark']` ancestor selector**

Delete the `[data-theme='dark'] [data-range-calendar-root]` block. The semantic tokens (`--dry-color-bg-raised`, `--dry-color-stroke-weak`, etc.) already resolve to dark values when the theme is dark. Keep the `@media (prefers-color-scheme: dark)` block only if `.theme-auto` requires explicit overrides not handled by the token system.

- [ ] **Step 4: Root keeps only root-level tokens and box styles**

Root should keep only `[data-range-calendar-root]` with padding, background, border, radius, shadow, color, font.

- [ ] **Step 5: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/range-calendar/
git commit -m "refactor(range-calendar): colocate grid styles with grid component"
```

---

## Task 10: Map Root — Remove redundant theme ancestor selector

**Files:**

- Modify: `packages/ui/src/map/map-root.svelte`

- [ ] **Step 1: Delete `[data-theme='dark']` ancestor selector**

Delete:

```css
[data-theme='dark'] [data-map-popup] [data-map-mapboxgl]-popup-content,
[data-theme='dark'] [data-map-popup] [data-map-maplibregl]-popup-content {
	background: var(--dry-color-bg-raised, #1e1e2e);
}
```

The `--dry-color-bg-raised` semantic token already resolves to the correct dark value when the theme is dark. The fallback `#1e1e2e` is only for when no theme is loaded.

- [ ] **Step 2: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/map/
git commit -m "refactor(map): remove redundant dark theme ancestor selector"
```

---

## Task 11: Markdown Renderer — Legitimate `:global` usage

**Files:**

- Modify: `packages/ui/src/markdown-renderer/markdown-renderer.svelte`

- [ ] **Step 1: Wrap child element selectors in scoped `:global` block**

This is the one case where Svelte docs explicitly prescribe `:global` — the component renders dynamic HTML elements via a snippet. Wrap all the child element selectors (h1-h6, p, a, ul, ol, li, blockquote, code, strong, em, img) in a scoped `:global` block:

```css
[data-markdown-renderer-root] {
	/* ...keep root-level styles as-is... */
}

[data-markdown-renderer-root] :global {
	h1,
	h2,
	h3,
	h4,
	h5,
	h6 {
		color: var(--dry-markdown-heading-color);
		font-weight: 600;
		line-height: 1.25;
		margin-top: 1.5em;
		margin-bottom: 0.5em;
	}

	h1 {
		font-size: var(--dry-type-heading-2-size, var(--dry-type-heading-2-size));
		margin-top: 0;
	}
	/* ...etc — keep all existing rules, just nest inside :global block... */
}
```

**NOTE:** This is NOT the banned `:global()` function selector. This is the scoped `:global { }` block, which is Svelte's prescribed pattern for styling dynamically rendered children. The CLAUDE.md ban on `:global()` refers to the function form that breaks scoping boundaries — the block form preserves the parent scope.

- [ ] **Step 2: Update CLAUDE.md to clarify the `:global` distinction**

Add clarification to the CSS Discipline section — the ban is on `:global()` function selectors that break scope, NOT on scoped `:global { }` blocks for dynamic content.

- [ ] **Step 3: Build and verify**

```bash
bun run --filter '@dryui/ui' build
```

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/markdown-renderer/ CLAUDE.md
git commit -m "refactor(markdown-renderer): use scoped :global block for dynamic content styles"
```

---

## Task 12: Final validation

- [ ] **Step 1: Full validate pipeline**

```bash
bun run validate --no-test
```

Expected: 0 errors, passes completely.

- [ ] **Step 2: Verify no `svelte-ignore css_unused_selector` anywhere**

```bash
grep -r 'svelte-ignore css_unused_selector' packages/ui/src/ apps/ --include='*.svelte'
```

Expected: no matches.

- [ ] **Step 3: Run tests**

```bash
bun run test
```

- [ ] **Step 4: Commit any remaining fixes**
