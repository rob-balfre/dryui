# Container Queries & Grid Layouts in Svelte: A DRY Approach

**Date:** April 2026
**Scope:** Deep research into container queries, CSS Grid, scoped styles, and DRY patterns for a Svelte 5 component library (DryUI)

---

## Table of Contents

1. [Browser Baseline (April 2026)](#1-browser-baseline-april-2026)
2. [Svelte 5 Scoped Styles & Container Queries](#2-svelte-5-scoped-styles--container-queries)
3. [DryUI's Current Grid Implementation](#3-dryuis-current-grid-implementation)
4. [Competing Framework Patterns](#4-competing-framework-patterns)
5. [Pure CSS DRY Patterns](#5-pure-css-dry-patterns)
6. [CSS @scope — The New Baseline Tool](#6-css-scope--the-new-baseline-tool)
7. [Recommendations for DryUI](#7-recommendations-for-dryui)
8. [Sources](#8-sources)

---

## 1. Browser Baseline (April 2026)

Every feature below is now production-safe across all major browsers.

| Feature                                                    | Status                    | Support                            | Notes                                                       |
| ---------------------------------------------------------- | ------------------------- | ---------------------------------- | ----------------------------------------------------------- |
| **Container size queries**                                 | Baseline Widely Available | Chrome 105+, FF 110+, Safari 16+   | ~96% global. Production since 2023                          |
| **Container query units** (`cqi`, `cqb`, `cqmin`, `cqmax`) | Baseline Widely Available | Same as size queries               | Use `cqi`/`cqb` (logical) over `cqw`/`cqh` (physical)       |
| **Container style queries** (`@container style()`)         | Partial                   | Chrome 111+, Edge 111+, Safari 18+ | **Firefox still missing.** Only custom property conditions  |
| **CSS Subgrid**                                            | Baseline Widely Available | Chrome 117+, FF 71+, Safari 16+    | ~97% global. Safe for production                            |
| **CSS Nesting**                                            | Baseline Widely Available | Chrome 120+, FF 117+, Safari 17.2+ | Relaxed syntax (no `&` needed for elements) in all browsers |
| **`@scope`**                                               | Baseline Newly Available  | Chrome 118+, FF 146+, Safari 17.4+ | FF 146 shipped Dec 2025, completing support                 |
| **`:has()`**                                               | Baseline Widely Available | Chrome 105+, FF 121+, Safari 15.4+ | ~96% support                                                |
| **`@layer`**                                               | Baseline Widely Available | Chrome 99+, FF 97+, Safari 15.4+   | Mature since March 2022                                     |
| **Scroll-state queries**                                   | Partial                   | Chrome/Edge/Opera only             | Not yet in Firefox or Safari                                |

### Key Takeaway

Container **size** queries, subgrid, nesting, `:has()`, `@layer`, and `@scope` are all safe to ship. Container **style** queries (querying custom property values) are not yet cross-browser — Firefox is the holdout. Scroll-state queries are Chrome-only.

---

## 2. Svelte 5 Scoped Styles & Container Queries

### How Svelte Scoping Works

Svelte scopes styles by adding a hash class (e.g., `svelte-abc123`) to affected elements. For complex selectors, the hash applies to the first and last selector of each rule. Multiple occurrences use `:where(.svelte-xyz123)` to prevent specificity inflation.

### Container Queries Inside `<style>` Blocks

`@container` rules **work correctly** inside Svelte's scoped `<style>` blocks. Support was added via [PR #8275](https://github.com/sveltejs/svelte/pull/8275) (closing [Issue #6969](https://github.com/sveltejs/svelte/issues/6969)).

**How it compiles:** Svelte treats `@container` the same as `@media` — it scopes the **selectors inside** the at-rule, not the at-rule itself:

```svelte
<!-- What you write -->
<style>
  @container (max-width: 300px) {
    .card { padding: 1rem; }
  }
</style>

<!-- What Svelte outputs -->
<style>
  @container (max-width: 300px) {
    .card.svelte-abc123 { padding: 1rem; }
  }
</style>
```

The `@container` wrapper passes through untouched. Only inner selectors get the scoping hash.

### Known Issues & Edge Cases

1. **`container-name` is NOT scoped/hashed.** Container names are global CSS identifiers. If two components use the same `container-name`, they collide. Svelte does not namespace them (unlike `@keyframes` which has the `-global-` prefix convention).

2. **css-tree parser lag.** Svelte's CSS parser relies on a forked css-tree. Newer CSS syntax (e.g., scroll-state queries) may throw parse errors in `svelte-check` ([Issue #2833](https://github.com/sveltejs/language-tools/issues/2833)).

3. **`container-type: inline-size` breaks certain layouts.** Setting `container-type` establishes size containment, which means the element cannot be sized by its contents in the inline direction. This can collapse flex items or elements without explicit sizing.

4. **No custom properties in query conditions.** This is a CSS limitation, not Svelte:
   ```css
   /* This does NOT work in any browser */
   --tablet: 600px;
   @container (min-width: var(--tablet)) {
   }
   ```

### Future: Svelte May Use `@scope` Internally

Rich Harris has [indicated](https://github.com/sveltejs/svelte/issues/10807) that Svelte may replace its hash-class scoping with native CSS `@scope` once browser support is wide enough. This would eliminate specificity artifacts from the hash-class approach. A new `:global { ... }` block syntax is also planned ([Issue #10815](https://github.com/sveltejs/svelte/issues/10815)).

### Svelte 5 Features for Responsive Layouts

**`MediaQuery` from `svelte/reactivity` (5.7.0+):**

```svelte
<script>
	import { MediaQuery } from 'svelte/reactivity';
	const large = new MediaQuery('min-width: 800px');
</script>
```

Caveat: causes hydration mismatch during SSR. **CSS container queries are preferred** for layout changes — no hydration issues, and they respond to container size, not viewport.

**`$derived` for computed styles:**

```svelte
<script>
	let { columns = 3 }: { columns: number } = $props();
	let gridStyle = $derived(`--dry-grid-columns: repeat(${columns}, 1fr)`);
</script>
```

**Snippets replace slots** — enable flexible grid area composition:

```svelte
<Grid>
	{#snippet sidebar()}<nav>...</nav>{/snippet}
	{#snippet content()}<main>...</main>{/snippet}
</Grid>
```

---

## 3. DryUI's Current Grid Implementation

### Architecture

**Primitives layer** (`packages/primitives/src/grid/`): Bare `<div>` wrappers. No styles, no layout logic.

**UI layer** (`packages/ui/src/grid/`): Compound component (`Grid` + `Grid.Area`) with a pure CSS custom property API and zero layout props.

### Grid API

**Props:**

- `name?: string` — optional container name (defaults to auto-generated `dry-grid-xxxx`)
- `vars?: Record<string, string>` — base CSS custom property values
- `breakpoints?: Array<{ when: string; vars: Record<string, string> }>` — responsive overrides

**CSS custom properties:**

| Token                | CSS Property            | Fallback  |
| -------------------- | ----------------------- | --------- |
| `--dry-grid-areas`   | `grid-template-areas`   | `none`    |
| `--dry-grid-columns` | `grid-template-columns` | `1fr`     |
| `--dry-grid-rows`    | `grid-template-rows`    | `auto`    |
| `--dry-grid-gap`     | `gap`                   | `0`       |
| `--dry-grid-align`   | `align-items`           | `stretch` |

**Grid.Area** reads `--dry-grid-area` for its `grid-area` value (fallback: `auto`), plus `min-width: 0` for blowout prevention.

### Responsive Mechanism: Runtime Style Injection

The Grid uses a unique approach for responsive behavior:

1. Generates a unique ID (`data-dry-grid="dry-grid-xxxx"`) via `{@attach initGrid}`
2. Sets `container-type: inline-size` and `container-name` on the outer wrapper
3. Builds CSS string via `$derived.by()` generating `@container` rules
4. Injects via `{@html '<style>...'}`

```svelte
<Grid
  name="docs"
  vars={{
    '--dry-grid-areas': '"header" "nav" "content"',
    '--dry-grid-columns': '1fr',
    '--dry-grid-rows': 'auto 1fr'
  }}
  breakpoints={[
    {
      when: '(min-width: 48rem)',
      vars: {
        '--dry-grid-areas': '"header header" "nav content"',
        '--dry-grid-columns': '16rem 1fr'
      }
    },
    {
      when: '(min-width: 64rem)',
      vars: { '--dry-grid-columns': '18rem 1fr' }
    }
  ]}
>
```

### Container Query Usage Across the Codebase

Container queries are used **extensively** — 68 files matched. Two patterns:

**1. Component-internal (most common):** Components set `container-type: inline-size` on their root and use `@container` in scoped `<style>` for their own internal layout adaptation. Examples: Card, Navbar, Footer, Dialog, EmptyState, Input, Textarea, Select, Combobox, DateField.

**2. Grid's breakpoints system (unique):** Only Grid uses runtime-injected `<style>` + named containers for consumer-defined responsive breakpoints.

### Gaps Identified

1. **Flex and Stack have no responsive behavior** — no container queries, no breakpoints
2. **Some doc components still use `@media`** for layout where `@container` would be more portable
3. **Grid's `{@html}` injection** works but departs from Svelte's scoped style model; each Grid instance adds a `<style>` element
4. **No shared container query abstraction** — each component defines breakpoints independently
5. **Grid breakpoints target child CSS vars indirectly** — sets vars on inner `.grid` via `> *` selector

---

## 4. Competing Framework Patterns

### Vue 3 (`<style scoped>`)

Container queries work inside `<style scoped>` identically to Svelte — the `@container` at-rule passes through, and Vue rewrites only the inner selectors to include the `data-v-` attribute. The standard DRY pattern is the same: CSS custom properties on a wrapper, with container queries adjusting them.

**Limitation:** Child components require `:deep()` to target elements inside container queries — the scoping attribute only exists on elements rendered by the current component.

### React / Tailwind CSS v4

Container queries are **first-class in Tailwind v4** (January 2025) — no plugin required.

```html
<div class="@container">
	<div class="grid grid-cols-1 @sm:grid-cols-3 @lg:grid-cols-4">
		<!-- Content -->
	</div>
</div>
```

- `@container` utility sets `container-type: inline-size`
- `@sm:`, `@md:`, `@lg:` variants (prefixed with `@`) target container width
- Named containers via slash: `@container/sidebar` parent, `@sm/sidebar:grid-cols-2` child
- Max-width and range queries: `@max-sm:`, stacked `@min-md:@max-lg:`

This is the most ergonomic container query DX in the React ecosystem.

### CSS Modules (React, Solid)

Container queries work without issues in `.module.css` files. Class names are hashed; `@container` passes through as a grouping rule. Named containers work fine. No special handling needed.

### Web Components / Shadow DOM

Container queries are an **excellent fit** for shadow DOM:

```js
class ResponsiveCard extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          container-type: inline-size;
          container-name: card;
        }
        .content { grid-template-columns: 1fr; }

        @container card (min-width: 400px) {
          .content { grid-template-columns: 200px 1fr; }
        }
      </style>
      <div class="content"><slot></slot></div>
    `;
	}
}
```

`:host` naturally serves as the containment context. Styles are fully encapsulated. No build tools needed. **Limitation:** Cannot query containers outside the shadow boundary.

### Cross-Framework Consensus

Every framework handles container queries the same way: the `@container` at-rule passes through untouched, and only the selectors inside get scoped/hashed/attributed. The DRY pattern is universal: **CSS custom properties driven by container queries**.

---

## 5. Pure CSS DRY Patterns

### Pattern 1: Intrinsic Grid (Zero Queries)

The RAM pattern — Repeat, Auto, Minmax. Handles most responsive cases without any queries:

```css
.auto-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(min(var(--grid-min, 16rem), 100%), 1fr));
	gap: var(--grid-gap, 1rem);
}
```

Items wrap automatically when the container is too narrow. The `min()` function prevents overflow when the container is narrower than the minimum. Configurable via `--grid-min`.

**When to use:** Uniform item grids (cards, product listings, thumbnails). No breakpoints, no container queries needed.

### Pattern 2: Container Queries + CSS Custom Properties

The DRY insight: container queries change **custom property values**, not layout rules. The grid definition is written once:

```css
.grid-wrapper {
	container-type: inline-size;
	container-name: layout;
}

.grid {
	display: grid;
	grid-template-columns: var(--grid-columns, 1fr);
	grid-template-areas: var(--grid-areas, none);
	gap: var(--grid-gap, 1rem);
}

@container layout (min-width: 48rem) {
	.grid {
		--grid-columns: 1fr 1fr;
		--grid-areas: 'sidebar content';
	}
}

@container layout (min-width: 64rem) {
	.grid {
		--grid-columns: 16rem 1fr 16rem;
		--grid-areas: 'nav content aside';
	}
}
```

**When to use:** Named area layouts (app shells, dashboards, page structures).

### Pattern 3: Named Containers for Nested Layouts

Without names, `@container` matches the nearest ancestor with `container-type` set. Named containers prevent ambiguity:

```css
.page {
	container: page / inline-size;
}
.sidebar {
	container: sidebar / inline-size;
}

@container sidebar (max-width: 200px) {
	.nav-label {
		display: none;
	}
}

@container page (min-width: 60rem) {
	.page-grid {
		grid-template-columns: 250px 1fr;
	}
}
```

**Best practices for naming:**

- Name every container in nested scenarios
- Query one level up — children carry their own container
- Use component-scoped names to avoid collisions
- Page layout = media queries; component layout = container queries

### Pattern 4: Container Query Units for Fluid Scaling

`cqi` = 1% of container's inline size. Combined with `clamp()`:

```css
.card {
	container-type: inline-size;
}

.card h2 {
	font-size: clamp(1rem, 4cqi, 2rem);
}

.card .content {
	padding: clamp(var(--dry-space-2), 3cqi, var(--dry-space-8));
}
```

Typography and spacing scale fluidly with the component's container, not the viewport.

### Pattern 5: Subgrid + Container Queries

Subgrid enables aligned nested components. Combined with container queries:

```css
.product-grid {
	container-type: inline-size;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1rem;
}

.product-card {
	display: grid;
	grid-template-rows: subgrid;
	grid-row: span 3; /* header, body, footer aligned across cards */
}

@container (min-width: 600px) {
	.product-grid {
		grid-template-columns: repeat(3, 1fr);
	}
}
```

All cards in a row have aligned headers, bodies, and footers regardless of content length.

### Pattern 6: Every Layout's "Switcher" (No Queries Needed)

A CSS-math-only approach that flips layout based on container width:

```css
.switcher {
	display: flex;
	flex-wrap: wrap;
	gap: var(--space, 1rem);
}

.switcher > * {
	flex-grow: 1;
	flex-basis: calc((var(--threshold, 30rem) - 100%) * 999);
}
```

When the container is wider than `--threshold`, items sit side by side. When narrower, they stack. Zero queries, zero JavaScript, pure CSS math.

### Pattern 7: Self-Referencing Container (Kevin Geary)

A technique for declaring the parent as a container from the child's perspective:

```css
.component {
	:has(> &) {
		container-type: inline-size;
	}
}
```

---

## 6. CSS @scope — The New Baseline Tool

`@scope` reached Baseline Newly Available in December 2025 (Firefox 146 was the last to ship). It provides **proximity-based style scoping** natively in CSS.

### Basic Syntax

```css
@scope (.card) {
	h2 {
		font-size: 1.25rem;
	}
	p {
		color: var(--dry-color-text-weak);
	}
}
```

### Donut Scoping (Lower Boundary)

Styles apply inside the scope root but stop before the boundary:

```css
@scope (.card) to (.card-body) {
	/* Applies to .card's header area but not inside .card-body */
	a {
		font-weight: 600;
	}
}
```

### Proximity-Based Resolution

When selectors have equal specificity, the scope closest to the matched element wins. This eliminates manual specificity overrides:

```css
@scope (.light-theme) {
	p {
		color: black;
	}
}
@scope (.dark-theme) {
	p {
		color: white;
	}
}
/* Whichever scope root is closer to <p> wins */
```

### Relevance to Svelte and DryUI

- **Svelte already scopes** — `@scope` is less critical for Svelte components than for vanilla CSS
- **Donut scoping is useful** for slotted/projected content that Svelte's hash scoping can't reach
- **Svelte may adopt `@scope` internally** in the future, replacing hash-class scoping
- **For DryUI:** `@scope` could replace some `data-*` attribute targeting in component-internal styles, providing cleaner CSS without data-attribute selectors

### Combined with Container Queries

```css
.card {
	container-type: inline-size;
}

@container (max-width: 300px) {
	@scope (.card) {
		.card-header {
			flex-direction: column;
		}
		.card-actions {
			gap: var(--dry-space-1);
		}
	}
}
```

---

## 7. Recommendations for DryUI

### The Modern DRY Principle

The DRY approach for container queries + grid in Svelte 5 is a **three-tier system**:

```
Default CSS custom properties
    ↓ overridden by
Container queries (component-internal breakpoints)
    ↓ overridden by
Consumer CSS custom properties (Svelte --prop syntax)
```

Grid definition is written once. Responsiveness is expressed as custom property value changes, not layout rule duplication.

### Specific Recommendations

#### 1. Keep the CSS Custom Property API

DryUI's `--dry-grid-*` pattern is the correct approach. It matches the cross-framework consensus. The grid declaration is written once; only variable values change at breakpoints.

#### 2. Use Intrinsic Grid (RAM) as Default

For uniform grids, the `auto-fill` + `minmax` + `min()` pattern handles responsiveness without any container queries or breakpoints:

```css
grid-template-columns: repeat(auto-fill, minmax(min(var(--dry-grid-min, 16rem), 100%), 1fr));
```

Expose as `--dry-grid-min`. Only use explicit breakpoints when discrete layout shifts are needed (e.g., named areas).

#### 3. Always Set `container-type: inline-size` on Grid

Every Grid instance should be its own responsive context. This is already done.

#### 4. Use Named Containers to Avoid Collisions

Since Svelte does **not** scope `container-name`, use unique or configurable names. The current auto-generated `dry-grid-xxxx` approach is correct.

#### 5. Consider Extending Responsive Behavior to Flex and Stack

Flex and Stack currently have no container-query-driven breakpoints. A simple pattern: Flex switches `direction` at a container width threshold, Stack switches from vertical to horizontal.

#### 6. Use Container Query Units for Fluid Spacing

```css
padding: clamp(var(--dry-space-2), 3cqi, var(--dry-space-8));
gap: clamp(var(--dry-space-2), 2cqi, var(--dry-space-6));
```

Components get fluid spacing that scales with their container.

#### 7. Don't Use Style Queries Yet

`@container style(--variant: compact)` is compelling but Firefox doesn't support it. Stick with `data-*` attributes for variant selection. Revisit when Firefox ships support.

#### 8. Don't Use `@scope` in Components Yet

Svelte's hash-class scoping already handles component-level scoping. `@scope` is Baseline Newly Available, not Widely Available. Monitor for Svelte's potential internal adoption. Could be useful in the docs app for styling projected content.

#### 9. Evaluate the `{@html}` Style Injection Pattern

The current Grid uses runtime `{@html '<style>...'}` for breakpoint injection. This works but has trade-offs:

- Each Grid instance injects a `<style>` element
- Bypasses Svelte's scoped style model entirely
- No compile-time CSS analysis

Consider whether the scoped `<style>` block approach used by 30+ other DryUI components could work for Grid's breakpoint case as well, using `data-*` selectors.

#### 10. The Gotcha: Container Can't Size Itself

A container cannot query its own dimensions — `container-type` establishes containment, which means the element's size is determined by extrinsic factors. Don't put `container-type: inline-size` on a flex item without giving it explicit or intrinsic sizing. DryUI's two-div structure (outer container + inner grid) correctly handles this.

---

## 8. Sources

### Official Documentation

- [Svelte Scoped Styles](https://svelte.dev/docs/svelte/scoped-styles)
- [MDN: CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
- [MDN: @scope](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@scope)
- [MDN: Container Size and Style Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_size_and_style_queries)

### Svelte Issues & PRs

- [Issue #6969: Support @container in scoped styles](https://github.com/sveltejs/svelte/issues/6969)
- [PR #8275: Add container query support](https://github.com/sveltejs/svelte/pull/8275)
- [Issue #10807: Support native CSS @scope](https://github.com/sveltejs/svelte/issues/10807)
- [Issue #8538: Component style exposure mechanism](https://github.com/sveltejs/svelte/issues/8538)
- [Issue #2833: svelte-check errors with scroll-state queries](https://github.com/sveltejs/language-tools/issues/2833)

### Articles & Guides

- [Container Queries in 2026: Powerful, but not a silver bullet — LogRocket](https://blog.logrocket.com/container-queries-2026/)
- [CSS @scope: Alternative to Naming Conventions — Smashing Magazine](https://www.smashingmagazine.com/2026/02/css-scope-alternative-naming-conventions/)
- [How to @scope CSS Now That It's Baseline — Frontend Masters](https://frontendmasters.com/blog/how-to-scope-css-now-that-its-baseline/)
- [How to @scope CSS Now That It's Baseline — Web Standards](https://web-standards.dev/news/2026/01/scope-css-baseline/)
- [An Interactive Guide to CSS Container Queries — Ahmad Shadeed](https://ishadeed.com/article/css-container-query-guide/)
- [CSS Container Queries for Designers — Ahmad Shadeed](https://ishadeed.com/article/container-queries-for-designers/)
- [Modern CSS 2026: Container Queries, Cascade Layers & Beyond — WeSkill](https://blog.weskill.org/2026/03/modern-css-2026-container-queries_01245639116.html)
- [Container Style Queries: Scoped CSS Variables — Johal.in](https://johal.in/container-style-queries-scoped-css-variables-2025/)
- [How Svelte Scopes Component Styles — Geoff Rich](https://geoffrich.net/posts/svelte-scoped-styles/)
- [CSS Container Queries in 2025 — Caisy](https://caisy.io/blog/css-container-queries)
- [CSS Subgrid: The Complete Guide for 2026 — DevToolbox](https://devtoolbox.dedyn.io/blog/css-subgrid-complete-guide)
- [The Switcher — Every Layout](https://every-layout.dev/layouts/switcher/)
- [Tailwind CSS v4 Container Queries — SitePoint](https://www.sitepoint.com/tailwind-css-v4-container-queries-modern-layouts/)

### Browser Support

- [Can I Use: Container Queries (Size)](https://caniuse.com/css-container-queries)
- [Can I Use: Container Style Queries](https://caniuse.com/css-container-queries-style)
- [CSS @scope — Can I Use](https://caniuse.com/css-cascade-scope)
- [Baseline Dashboard — web.dev](https://web.dev/baseline)
