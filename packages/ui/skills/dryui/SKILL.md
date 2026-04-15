---
name: dryui
description: 'Use when building UIs with DryUI (@dryui/ui) Svelte 5 components. Teaches correct patterns for compound components, theming, forms, and accessibility. Use MCP tools when available; fall back to CLI.'
---

# DryUI

Zero-dependency Svelte 5 components. All imports from `@dryui/ui`. Requires a theme CSS import. Svelte 5 runes only.

**Tradeoff:** These rules bias toward correctness over speed. For throwaway prototypes, use judgment.

## 1. Look Up Before You Write

**Never guess a component API. Always verify first.**

- Call `ask --scope component` or `ask --scope recipe` before using any component for the first time
- Component APIs vary — `bind:value`, `bind:open`, `bind:checked` are NOT interchangeable
- Compound vs simple, required parts, available props — all differ per component
- If you skip the lookup, you'll write plausible-looking code that silently breaks

The test: can you point to an `ask` call for every component or pattern in your output?

## 2. Everything is Compound Until Proven Otherwise

**Use `.Root`. Always check.**

Most DryUI components are compound — they require `<Card.Root>`, not `<Card>`. The bare name silently fails or renders wrong. Assume compound; verify with `ask --scope component`.

```svelte
<!-- Wrong -->
<Card>content</Card>
<!-- Right -->
<Card.Root>content</Card.Root>
```

Compound components are tracked in the manifest at `packages/mcp/src/component-catalog.ts`. Verify with `ask --scope component` before you assume a bare name works, then use `.Root` and wrap the parts inside it.

The test: every compound component in your markup uses `.Root`, and its parts are wrapped inside it. See `rules/compound-components.md` for the parts reference.

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

**3. Install the CLI** so every subsequent command is short and fast:

```bash
bun install -g @dryui/cli   # or: npm install -g @dryui/cli
```

**4. Bootstrap the project** — `init` detects your project state and applies whatever is missing:

```bash
dryui init             # existing project
dryui init my-app      # new project — scaffolds SvelteKit + DryUI in one step
cd my-app && bun run dev
```

This works for greenfield (empty directory), brownfield (existing non-SvelteKit project), and existing SvelteKit projects. Verify: `dryui detect` should show `project: ready`.

> **No global install?** `bunx @dryui/cli <cmd>` and `npx -y @dryui/cli <cmd>` work anywhere without installing — same commands, just slower (re-fetches on each call).

### Manual setup

1. `bun add @dryui/ui`
2. `bun add -d @dryui/lint` — enforces grid-only layout, bans flexbox/inline-style/width at build time. Without this step the CSS discipline rules are not enforced at build time, and only post-write `check` / CLI validation remain.
3. Wire the lint preprocessor in `svelte.config.js` (add `dryuiLint` as the **first** item in the `preprocess` array):

   ```js
   import { dryuiLint } from '@dryui/lint';

   /** @type {import('@sveltejs/kit').Config} */
   const config = {
   	preprocess: [
   		dryuiLint({
   			strict: true,
   			exclude: ['.svelte-kit/', '/dist/']
   		})
   		// keep any existing preprocessors after this
   	]
   };

   export default config;
   ```

4. Add `class="theme-auto"` to `<html>` in `src/app.html`
5. In root layout (`src/routes/+layout.svelte`), import themes:
   ```svelte
   <script>
   	import '@dryui/ui/themes/default.css';
   	import '@dryui/ui/themes/dark.css';
   </script>
   ```
6. Import `app.css` AFTER theme CSS if you have custom styles

> `dryui init` applies all six steps automatically — prefer it over manual setup when you can.

## Bindable Props — Common Confusion

Always verify with `ask --scope component`, but these are the most common mistakes:

- `bind:value` (Input, Select, Tabs...) vs `bind:checked` (Checkbox, Switch) vs `bind:pressed` (Toggle) vs `bind:open` (Dialog, Popover, Drawer...)
- Select and Combobox support both `bind:value` and `bind:open`
- ColorPicker also exposes `bind:alpha`; Transfer uses `bind:sourceItems` / `bind:targetItems`
- Tour uses `bind:active`, not `bind:open`

## Tools

Use these to look up APIs, discover components, plan setup, and validate code.

### Recommended workflow

1. `ask --scope recipe "<query>"` or `ask --scope component "<Component>"` before writing so you confirm kind, required parts, bindables, and canonical usage.
2. Build the route or component with raw CSS grid, `Container` for constrained width, and `@container` for responsive layout.
3. `check` after implementation to catch composition drift, layout violations, and accessibility regressions.
4. Never guess component shape from memory. DryUI is intentionally strict, and the lookup cost is lower than rework.

### MCP tools (preferred)

| Workflow             | Tools                                        |
| -------------------- | -------------------------------------------- |
| Project setup        | `ask --scope setup ""`                        |
| Lookup & composition | `ask --scope component`, `ask --scope recipe`, `ask --scope list` |
| Validation           | `check <file.svelte>`, `check <theme.css>`    |
| Audit                | `check`, `check <directory>`                  |

### CLI fallback

Install once with `bun install -g @dryui/cli` (or `npm install -g @dryui/cli`), then use the short form below. Every command outputs TOON (token-optimized, agent-friendly) by default. Pass `--text` for human-readable plain text, `--json` where supported, or `--full` to disable truncation.

```bash
dryui init [path] [--pm bun]    # Bootstrap SvelteKit + DryUI project
dryui info <component>          # Look up component API
dryui compose "date input"      # Composition guidance
dryui detect [path]             # Check project setup
dryui install [path]            # Print install plan
dryui review <file.svelte>      # Validate component
dryui diagnose <file.css>       # Validate theme CSS
dryui doctor [path]             # Audit workspace
dryui lint [path]               # Deterministic findings
dryui list                      # List components
```

Without a global install, prefix any command with `bunx @dryui/cli …` or `npx -y @dryui/cli …` — same behaviour, just slower (re-fetches on each call).

Categories: action, input, form, layout, navigation, overlay, display, feedback, interaction, utility

## Rule Files

Read these when you need deeper guidance:

- **`rules/compound-components.md`** — Parts lists, component selection table, common mistakes
- **`rules/theming.md`** — Three-tier token system, dark mode, palette customization
- **`rules/composition.md`** — Form patterns, page layouts, composition recipes
- **`rules/accessibility.md`** — Field.Root, ARIA, focus management, pre-ship checklist
- **`rules/svelte.md`** — Runes, snippets, native browser APIs, styling rules
- **`rules/design.md`** — Minimal code, no premature abstraction, naming conventions
- **`rules/visual-effects-performance.md`** — Tiered budgets and implementation rules for shader, blur, glass, and pointer-reactive effects
- **`rules/native-web-transitions.md`** — View Transition API, scroll animations, reduced-motion

---

**These rules are working if:** every component traces to a lookup, diffs contain zero hardcoded colors, and the reviewer finds nothing.
