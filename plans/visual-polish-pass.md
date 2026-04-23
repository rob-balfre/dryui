# DryUI Visual Polish Pass

Source material: [Details That Make Interfaces Feel Better](https://jakub.kr/writing/details-that-make-interfaces-feel-better) by Jakub Krehel.
Prior-art reference: [jakubkrehel/make-interfaces-feel-better](https://github.com/jakubkrehel/make-interfaces-feel-better) (prompt-level skill; we are aiming for a primitives-level bake-in instead).

## TL;DR

| #   | Rule                     | Status       | Phase | Risk     | Key artifact                                                   |
| --- | ------------------------ | ------------ | ----- | -------- | -------------------------------------------------------------- |
| 1   | Text wrapping            | HYBRID       | 1 + 4 | Low      | `:where(h1…h6)` in reset                                       |
| 2   | Concentric radius        | HYBRID       | 1 → 2 | Med      | `--dry-radius-nested-<container>` scale                        |
| 3   | Icon contextual motion   | HYBRID       | 3 + 4 | Low      | `IconSwap` on top of existing `[data-dry-icon-reveal]`         |
| 4   | Text crispness           | BAKE + CHECK | 1     | Low      | `-moz-osx-font-smoothing: grayscale`                           |
| 5   | Tabular numbers          | HYBRID       | 2 + 4 | Low      | `.dry-tabular-nums` already exists; audit remaining primitives |
| 6   | Interruptible animations | BAKE + CHECK | 4     | Low      | `polish/keyframes-on-interactive`                              |
| 7   | Enter stagger            | HYBRID       | 3 + 4 | Med      | `Enter`/`Stagger` building on existing `[data-dry-stagger]`    |
| 8   | Subtle exit              | HYBRID       | 3 + 4 | Med      | `leave` transition fn + `out:leave`                            |
| 9   | Optical alignment        | BAKE         | 2     | Low      | `:has()` + `--dry-optical-icon-offset`                         |
| 10  | Shadows over borders     | BAKE + CHECK | 2     | **High** | Redefine `--dry-shadow-sm`; drop Card border default           |
| 11  | Image outline            | BAKE + CHECK | 2     | Low      | `outline` + theme-aware `--dry-image-edge` (already set)       |

Legend: `BAKE` = primitive/token change · `CHECK` = new `--polish` rule · `RECIPE` = compositional doc · `HYBRID` = combination.

## Strategy

Three-layer treatment. **Bake-in** moves the rule into a primitive/token/reset so it ships correctly without anyone remembering — DryUI's highest-leverage surface. **Check** flags escape hatches (raw `<h1>`, raw `<img>`, hand-rolled keyframe on an interactive state) and points back to the primitive. **Recipe** covers compositional choices (stagger shape, word-split, exit subtlety) once the motion primitives land.

---

## 1. Text Wrapping

**Article:** `text-wrap: balance` on titles, `text-wrap: pretty` on paragraphs (prevents orphans, more subtle than balance). Demo widths shown around 215–220px.

**Current state in DryUI:**

- `packages/ui/src/heading/heading.svelte` already applies `text-wrap: balance` to every `h1`–`h6` it renders.
- `packages/ui/src/text/text.svelte` already applies `text-wrap: pretty` to its `p`, `span`, `div` output.

**Gap:** Raw HTML that bypasses the primitives (`<h1>` directly in markdown, `<p>` inside a recipe that forgot to swap to Text) gets no treatment. No global fallback in the theme reset.

**BAKE:**

- Append to theme reset at `packages/ui/src/themes/default.css` (the `html` block currently sets color + bg + font + smoothing):
  ```css
  :where(h1, h2, h3, h4, h5, h6) {
  	text-wrap: balance;
  }
  :where(p) {
  	text-wrap: pretty;
  }
  ```
  `:where()` keeps specificity at 0 so component CSS still wins. Raw elements inherit correct behavior without overriding primitives.

**CHECK — `polish/raw-heading`:**

- Detector: in `checkMarkup()` (`packages/lint/src/rules.ts`), scan for `<h[1-6]\b` tokens outside of `<script>`.
- Skip inside `<Heading>` already (obvious — regex only matches lowercase tags).
- Skip when the tag carries `data-dry-allow="heading"` or when the file has `<!-- dryui-allow raw-heading -->` near the match (use the existing `hasAllowComment` helper).
- Severity: `suggestion`.
- Message: `Raw <{tag}> used. Prefer <Heading level={n}>: gets text-wrap: balance, optical typography scale, correct measure limits by default.`
- Suggested fix: `Replace with <Heading level={n}>…</Heading>. Run: ask --scope component "Heading".`
- Catalog entry in `packages/lint/src/rule-catalog.ts` with `category: 'polish'`.

**CHECK — `polish/raw-paragraph` (optional, lower priority):**

- Detector: `<p\b[^>]*>` where the immediate context is a `<script>`-reachable template (i.e. not a markdown island).
- Severity: `info`. Many legitimate uses.
- Message: `Raw <p> used. <Text as="p"> adds text-wrap: pretty and measure caps.`
- Consider gating this behind an explicit opt-in so it doesn't flood diagnostics.

**RECIPE:** `ask --scope recipe "typography"` should list the pairings.

**Tests:** `packages/lint/src/rules.test.ts` additions — one positive, one allow-comment, one negative (inside `<Heading>…</Heading>`).

**Risk:** Low. `:where()` is stable everywhere we care about.

**Status:** HYBRID (BAKE + CHECK).

---

## 2. Concentric Border Radius

**Article:** Outer radius = inner radius + padding. Example: 20 outer / 12 inner / 8 padding. "One of the more important concepts… often goes unnoticed."

**Current state in DryUI:**

- Only `Card` implements this, inline:
  ```css
  --dry-card-radius: var(--dry-radius-2xl);
  --dry-radius-nested: max(
  	var(--dry-radius-sm),
  	calc(var(--dry-card-radius) - var(--dry-card-padding, var(--dry-space-8)))
  );
  --dry-btn-radius: var(--dry-radius-nested);
  ```
- `Input` uses `--dry-form-control-radius` (flat 8px), no adaptation to surrounding Field padding.
- `Dialog`, `Popover`, `DropdownMenu`, `Sheet`, `Drawer`, `Toast`, `Tooltip`, `ContextMenu`, `Menubar`, `Command` — none use a nested-radius helper.

**Gap:** The math lives in one component. Every other container that nests interactive children (dialogs with buttons, popovers with menu items, toasts with close buttons, sheets with inputs) re-derives radii by hand or inherits mismatched defaults.

**BAKE — introduce a shared utility:**

1. Add to `packages/ui/src/themes/default.css` (alongside existing tokens — no new file, convention is flat CSS in that folder):

   ```css
   :root {
   	/* Per-container outer radii */
   	--dry-radius-card: var(--dry-radius-2xl);
   	--dry-radius-dialog: var(--dry-radius-2xl);
   	--dry-radius-popover: var(--dry-radius-xl);
   	--dry-radius-sheet: var(--dry-radius-2xl);
   	--dry-radius-toast: var(--dry-radius-lg);
   	--dry-radius-tooltip: var(--dry-radius-md);

   	/* Per-container padding (what the container pads its children by) */
   	--dry-padding-card: var(--dry-space-8);
   	--dry-padding-dialog: var(--dry-space-6);
   	--dry-padding-popover: var(--dry-space-2);
   	--dry-padding-sheet: var(--dry-space-6);
   	--dry-padding-toast: var(--dry-space-3);
   	--dry-padding-tooltip: var(--dry-space-2);

   	/* Derived nested radii — use these on any child inside the container */
   	--dry-radius-nested-card: max(
   		var(--dry-radius-sm),
   		calc(var(--dry-radius-card) - var(--dry-padding-card))
   	);
   	--dry-radius-nested-dialog: max(
   		var(--dry-radius-sm),
   		calc(var(--dry-radius-dialog) - var(--dry-padding-dialog))
   	);
   	--dry-radius-nested-popover: max(
   		var(--dry-radius-xs, 2px),
   		calc(var(--dry-radius-popover) - var(--dry-padding-popover))
   	);
   	--dry-radius-nested-sheet: max(
   		var(--dry-radius-sm),
   		calc(var(--dry-radius-sheet) - var(--dry-padding-sheet))
   	);
   	--dry-radius-nested-toast: max(
   		var(--dry-radius-xs, 2px),
   		calc(var(--dry-radius-toast) - var(--dry-padding-toast))
   	);
   	--dry-radius-nested-tooltip: max(
   		var(--dry-radius-xs, 2px),
   		calc(var(--dry-radius-tooltip) - var(--dry-padding-tooltip))
   	);
   }
   ```

2. Delete the inline derivation from `card-root.svelte`, have it consume `--dry-radius-card` / `--dry-radius-nested-card`.
3. Every container component ships with a CSS comment at the top of its `<style>`: `/* outer: var(--dry-radius-<name>); children inside the padded region use var(--dry-radius-nested-<name>). */`
4. Add a tiny token `--dry-radius-xs: 2px` to the radius scale so small containers can express "nearly-square" inner radii (currently the scale jumps 0 → 4 → 8).

**BAKE — Input ↔ Field nesting:**

- Introduce `--dry-padding-field: var(--dry-space-4)` (Field.Root's default outer padding when used as a card-wrapped field).
- When Input is a direct child of a padded Field, radius becomes `var(--dry-radius-nested-field)`.
- Implementation: Field.Root sets `--dry-input-radius: var(--dry-radius-nested-field)` in its context scope; standalone Input keeps its current 8px.

**CHECK — `polish/nested-radius-mismatch` (heuristic, low-severity):**

- Detector (hard, regex-only, so keep conservative): inside a component's style block, flag `border-radius: var(--dry-radius-2xl)` on a selector that is clearly a child (`.inner`, `.content`, `.item`, immediate nested selector under a `.root`) when the same file also sets a `--dry-radius-*` on the root. That pattern reliably indicates "I set outer radius and used the same token on a child without subtracting padding".
- Severity: `suggestion`.
- Message: `Child radius matches container radius. Use var(--dry-radius-nested-{container}) so the inner corners sit concentric with the outer.`
- Allow comment: `<!-- dryui-allow nested-radius -->`.

**RECIPE:** `ask --scope recipe "concentric radius"` explains the pattern + lists every `--dry-radius-nested-*` token.

**Tests:** Visual regression in `apps/playground` with a side-by-side (concentric vs. mismatched). Unit test: every `--dry-radius-nested-*` resolves to a value < its outer counterpart.

**Risk:** Medium. Changing Input radius inside Field will shift visuals for apps that rely on the current flat 8px. Gate behind a Field prop `nestRadius={true}` if regression risk is material; revisit after dogfooding.

**Status:** HYBRID (BAKE + CHECK + RECIPE).

---

## 3. Animate Icons Contextually

**Article:** Animate `opacity`, `scale`, `blur` on icon state change. Author prefers Motion library + springs; CSS-only is fine. Code example: `{isCopied ? <CheckIcon /> : <CopyIcon />}`.

**Current state in DryUI:**

- Button has `scale(0.98)` active press + color/bg/border transitions on `--dry-duration-fast` (120ms) ✓.
- `[data-dry-icon-reveal]` attribute hook already defined at `default.css:575-594` — opacity/scale/blur transition tied to `data-state="hidden"` / `data-hidden` / `hidden`. Used wherever an icon is conditionally rendered with that attribute.
- No wrapper primitive that swaps between two icon slots (the existing hook reveals one icon; "copy → check" style transitions still need a component).

**Gap:** The reveal CSS works on one icon showing/hiding. The common "swap A for B" pattern (copy button toggling check, play/pause, chevron flip) has no primitive — users either render both and toggle `hidden` (works with existing CSS hook, awkward) or roll their own (often with a keyframe that isn't interruptible — see #6).

**BAKE — new primitive `IconSwap` (builds on existing hook):**

- Location: `packages/ui/src/icon-swap/icon-swap.svelte`.
- API:
  ```svelte
  <IconSwap
    icon={isCopied ? CheckIcon : CopyIcon}
    size="md"
    duration="fast"  <!-- defaults to --dry-duration-fast -->
    ease="spring-snappy"
  />
  ```
- Internal: renders two absolutely-positioned Icon slots each carrying `data-dry-icon-reveal`, toggles `data-state="hidden"` on the outgoing slot. Reuses the existing reveal CSS + tokens — no new keyframe. Transitions retarget mid-swap, so spamming the toggle feels right (#6).
- Tokens: reuses whatever `[data-dry-icon-reveal]` already consumes. Only add new tokens if the swap motion needs to diverge from the reveal motion (confirm when implementing — probably no new tokens).
- Respects `prefers-reduced-motion: reduce` via the reveal CSS which already has a reduced-motion branch at `default.css:589-594`.

**BAKE — apply inside existing primitives that swap icons:**

- `Collapsible`, `Accordion`, `Select`, `Combobox` chevrons — wrap the chevron in an `IconSwap` pattern (or inline equivalent) so open/close animates.
- `Button` with `loading` prop: swap between leading icon and spinner via IconSwap semantics.
- `Toggle`, `Checkbox` state icons.

**CHECK — `polish/raw-icon-conditional`:**

- Detector: inside a `<Button>` or any component opening tag, find a child expression of the form `{<cond> ? <IconA/> : <IconB/>}` (regex over the resolved template — same approach Reviewer uses). Also match the sibling pattern `{#if …}<Icon… />{:else}<Icon… />{/if}` inside Button.
- Severity: `suggestion`.
- Message: `Conditional icon swap without animation. Use <IconSwap icon={cond ? A : B} /> for opacity/scale/blur transitions.`
- Suggested fix: `Replace the ternary with <IconSwap>.`

**RECIPE:** `ask --scope recipe "icon swap"` — copy button, flipping chevron, play/pause.

**Tests:** IconSwap visual regression (both states, mid-transition snapshot). Reduced-motion variant test. Check rule positive + negative.

**Risk:** Low — new primitive, additive.

**Status:** HYBRID (BAKE + CHECK + RECIPE).

---

## 4. Make Text Crisp

**Article:** `-webkit-font-smoothing: antialiased` on layout. Addresses macOS subpixel rendering looking heavy. Tailwind equivalent: `antialiased`.

**Current state in DryUI:**

- `packages/ui/src/themes/default.css` already sets `-webkit-font-smoothing: antialiased` on `html` ✓.

**Gap:**

- No `-moz-osx-font-smoothing: grayscale` (Firefox macOS equivalent).
- If a consumer forgets to import the theme CSS at all, nothing applies. There's already an existing "theme import order" rule; ensure it also flags the absence case.

**BAKE:**

- One-liner addition to the `html {}` block in `default.css` and every other theme CSS file (dark.css, midnight.css, aurora.css, terminal.css):
  ```css
  html {
    ...
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;       /* + NEW */
    text-rendering: optimizeLegibility;        /* + NEW, helps kerning in headings */
  }
  ```
  `text-rendering: optimizeLegibility` is modestly slower but fine for marketing / UI surfaces and makes heading kerning visibly better. If perf is a concern it can be scoped to `:where(h1, h2, h3, h4)` instead.

**CHECK — `polish/missing-theme-smoothing`:**

- Detector: examine the workspace's resolved theme CSS bundle. If `-webkit-font-smoothing: antialiased` is missing from any `html` or `:root` rule in the user's imported CSS, flag at workspace scope.
- Severity: `warning`.
- Message: `Theme file missing -webkit-font-smoothing: antialiased on html. Import @dryui/ui/themes/default.css or set it explicitly.`

**RECIPE:** N/A — it's a zero-code default.

**Tests:** Snapshot theme CSS, assert presence of both smoothing declarations.

**Risk:** Trivially low.

**Status:** BAKE + CHECK.

---

## 5. Use Tabular Numbers

**Article:** `font-variant-numeric: tabular-nums` on digits that update (counters, clocks). Caveat: some fonts (Inter) change numeral glyphs under this flag.

**Current state in DryUI:**

- `FormatNumber` ✓, `Progress` label ✓, `FormatBytes` (`format-bytes.svelte:60`) ✓.
- Utility class `.dry-tabular-nums` already exists at `default.css:571`.
- `RelativeTime` (`relative-time.svelte:60-68`) and `FormatDate` (`format-date.svelte:72-82`) both **missing** — verified.
- `Badge` — no numeric variant.
- No Timer / Clock / Countdown primitives.

**Gap:** Utility class exists but primitives haven't all adopted it. No token abstracting the property (so a future swap to, say, `slashed-zero tabular-nums` requires a code sweep).

**BAKE — add indirection token + adopt the existing utility class:**

- Add to `default.css`:
  ```css
  :root {
  	--dry-numeric-variant: tabular-nums;
  }
  ```
  Rewrite `.dry-tabular-nums` to consume the token: `.dry-tabular-nums { font-variant-numeric: var(--dry-numeric-variant); }`. Keep the class name (it's the established API).

**BAKE — fill the audit gaps identified above:**

1. `RelativeTime` — apply `.dry-tabular-nums` or the declaration directly.
2. `FormatDate` — same.
3. `Badge` — add `numeric` prop. When set, apply tabular-nums + `min-width: 1.5em` so counts like `9 → 10` don't jitter.
4. Any future `Timer` / `Countdown` / `Clock` primitive — use the class.
5. `Input[type="number"]` — apply in the input CSS.

**BAKE — new `Numeric` primitive (optional, low-cost):**

- `packages/ui/src/numeric/numeric.svelte`:

  ```svelte
  <Numeric value={count} stable align="end" />
  ```

  - `stable`: reserves minimum character width based on current magnitude.
  - `align="end"` / `"start"` / `"center"`.
  - Applies tabular-nums by default.

- Thin wrapper but gives agents a clear target.

**CHECK — `polish/numeric-without-tabular` (heuristic):**

- Because we can't reliably tell "does this span render digits" from static analysis, restrict detection to two cheap signals:
  1. Component name pattern: files named `*timer*.svelte`, `*clock*.svelte`, `*countdown*.svelte`, `*count*.svelte`, `*score*.svelte`, `*price*.svelte`, `*meter*.svelte` whose styles don't include `tabular-nums` anywhere.
  2. Raw text node matching `/^[\s\d.,:\-]+$/` (only digits / punctuation / whitespace) with no `tabular-nums` in enclosing style.
- Severity: `suggestion`.
- Message: `Numeric display without tabular-nums — digits will jitter as values change. Apply class "dry-tabular-nums" or font-variant-numeric: var(--dry-numeric-variant).`

**CHECK — `polish/inter-tabular-warning` (informational, optional):**

- When `font-variant-numeric: tabular-nums` is used AND the font stack contains `Inter`, emit an info diagnostic noting that Inter changes numeral shapes. Low priority.

**RECIPE:** `ask --scope recipe "numeric display"`.

**Tests:** Component-level snapshot for each numeric primitive; rule tests for both detection signals.

**Risk:** Low. `tabular-nums` is purely visual.

**Status:** HYBRID (BAKE + CHECK + RECIPE).

---

## 6. Make Animations Interruptible

**Article:** CSS transitions retarget; keyframes run on a fixed timeline. Use transitions for interactions, keyframes for staged one-shot sequences. iOS is prevalent with this; non-interruptible animations feel broken.

**Current state in DryUI:**

- Button uses transitions ✓.
- Badge pulse uses a keyframe — but it's a continuous looping animation, not tied to an interaction, so it's correct usage.
- No articulated convention; no check.

**Gap:** No guardrail. Nothing stops a user from writing `@keyframes rotate-open` and applying it on `[data-state="open"]` — which creates a non-interruptible open/close feel.

**BAKE:** Purely conventional — Enter/Exit primitives (#7, #8) and IconSwap (#3) all use transitions, not keyframes. So the bake-in is: **DryUI's motion primitives are transition-based by design.**

**CHECK — `polish/keyframes-on-interactive`:**

- Detector:
  1. Scan style block for `@keyframes (\w+)` names → set `S`.
  2. Scan style block for `animation(-name)?:\s*(\w+)` applications → for each name in `S`, find the enclosing selector.
  3. If the enclosing selector contains any of `:hover`, `:focus`, `:focus-visible`, `:active`, `[data-state="open"]`, `[data-state="closed"]`, `[aria-expanded=`, `[data-open]`, `[data-collapsed]` — flag.
- Severity: `warning`.
- Message: `Keyframe animation "{name}" applied on interactive state "{selector}". Keyframes run on a fixed timeline and don't retarget when the user changes intent mid-interaction. Use a CSS transition on the animated properties instead.`
- Suggested fix: `Replace @keyframes + animation: {name}… with transition: <props> var(--dry-duration-*) var(--dry-ease-*);`
- Allow comment: `<!-- dryui-allow keyframes-interactive -->` for legitimate continuous loop cases (rare when tied to a state, but pulsing "loading" indicator on `[data-state="loading"]` is valid).

**RECIPE:** `ask --scope recipe "interactive motion"` — contrast transition vs keyframe with a toggle example.

**Tests:** Three positive cases (keyframe on `:hover`, on `[data-state="open"]`, on `:focus`), two negatives (keyframe at top level not tied to state; transition on `:hover`).

**Risk:** The regex is a heuristic and will miss edge cases (animation applied via a class toggled by JS, not a selector). Accept as a best-effort polish flag.

**Status:** BAKE (convention) + CHECK + RECIPE.

---

## 7. Split and Stagger Entering Elements

**Article:** Break entering content into chunks, stagger with 80–100ms delays. Three modes: single block, per-section (100ms), per-word (80ms). Code:

```css
@keyframes enter {
	from {
		transform: translateY(8px);
		filter: blur(5px);
		opacity: 0;
	}
}
.animate-enter {
	animation: enter 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
	animation-delay: calc(var(--delay, 0ms) * var(--stagger, 0));
}
```

**Current state in DryUI:**

- Motion tokens exist: `--dry-duration-entrance: 480ms`, `--dry-stagger-step: 60ms`, `--dry-stagger-max: 8`, `--dry-motion-{distance,opacity,blur,scale}-*`, enter motion preset (`opacity: 0; blur: 16px; scale: 0.96`).
- **`[data-dry-stagger] > *` auto-indexer already exists** at `default.css:519-562`, covering 12 children with nth-child delays — this is the zero-JS path and it works.
- **`Reveal` component already exists** at `packages/ui/src/reveal/`. Need to read its scope (on-mount vs on-viewport, single-element vs container) before deciding whether `Enter`/`Stagger` extend Reveal or sit alongside it.
- No Svelte transition helper (no `in:enter={{ index }}` for programmatic, non-template, or conditional entrance).
- No word/letter split. Existing stagger is child-level only.
- Article numbers (800ms, 8px translate, 5px blur) diverge from existing tokens (480ms, 16px blur, 0.96 scale).

**Gap:** Programmatic / conditional entrance (Svelte `in:` transition). Word/letter split. Reconciling article's dramatic 800ms with DryUI's tighter 480ms entrance.

**BAKE — Motion module:**

Create `packages/ui/src/motion/` with:

### 7a. Svelte transition function — `enter`

```ts
// packages/ui/src/motion/enter.ts
import type { TransitionConfig } from 'svelte/transition';

interface EnterOptions {
  index?: number;         // stagger index, multiplied by delayStep
  delay?: number;         // explicit delay override (ms)
  duration?: number;      // ms; defaults to --dry-duration-entrance resolved
  translate?: number;     // px offset from; default 8
  blur?: number;          // px blur from; default 5
  easing?: (t: number) => number;
}

export function enter(node: HTMLElement, opts: EnterOptions = {}): TransitionConfig { … }
```

Used:

```svelte
<div in:enter={{ index: 0 }}>Title</div>
<div in:enter={{ index: 1 }}>Description</div>
<div in:enter={{ index: 2 }}>Buttons</div>
```

### 7b. Component — `<Enter>`

Wraps children; passes `index` as a CSS custom property so CSS keyframes (for users who prefer CSS-only) can opt in:

```svelte
<Enter index={0}>
	<Heading level={1}>…</Heading>
</Enter>
<Enter index={1}>
	<Text>…</Text>
</Enter>
```

Internally just assigns `style="--dry-enter-index: {index}"` and applies a class that triggers the keyframe. Because the article's principle here is "one-shot on mount", keyframes are acceptable per #6 (staged sequence, not interactive state).

### 7c. Component — `<Stagger>`

Iterates children and assigns indices automatically:

```svelte
<Stagger step="section">
	<Heading level={1}>…</Heading>
	<Text>…</Text>
	<ButtonGroup>…</ButtonGroup>
</Stagger>
```

Props:

- `step`: `'section'` (100ms) | `'word'` (80ms) | `'letter'` (40ms) | `number` (explicit ms).
- `unit`: `'child'` (default) | `'word'` | `'letter'` — when word/letter, wraps text content with inline spans.
- `maxIndex`: clamp stagger so 60-item lists don't take 4.8 seconds.

### 7d. Tokens

```css
:root {
	--dry-enter-translate: 8px;
	--dry-enter-blur: 5px;
	--dry-enter-duration: 800ms;
	--dry-enter-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
	--dry-enter-stagger-section: 100ms;
	--dry-enter-stagger-word: 80ms;
	--dry-enter-stagger-letter: 40ms;
	--dry-enter-stagger-max: 16;
}

@keyframes dry-enter {
	from {
		transform: translateY(var(--dry-enter-translate));
		filter: blur(var(--dry-enter-blur));
		opacity: 0;
	}
}

.dry-enter {
	animation: dry-enter var(--dry-enter-duration) var(--dry-enter-ease) both;
	animation-delay: calc(
		var(--dry-enter-stagger-section) * min(var(--dry-enter-index, 0), var(--dry-enter-stagger-max))
	);
}

@media (prefers-reduced-motion: reduce) {
	.dry-enter {
		animation-duration: 1ms;
		animation-delay: 0ms;
	}
}
```

**Reconciling article vs existing tokens:** Keep the existing `--dry-duration-entrance: 480ms` for ambient component mount transitions (fast, utility feel). The new `--dry-enter-duration: 800ms` is for hero sections / dramatic reveals. Both can coexist; document the distinction in the motion recipe.

**CHECK — `polish/ad-hoc-enter-keyframe`:**

- Detector: `@keyframes (fadeIn|slideUp|slideIn|enter|reveal|stagger|appear)` or similar naming, OR keyframes whose body includes `opacity: 0` and either `translate`/`transform: translateY` or `filter: blur`.
- Severity: `suggestion`.
- Message: `Ad-hoc entrance animation. Use <Enter>/<Stagger> or in:enter={{ index }} for consistent timing and reduced-motion handling.`

**RECIPE:** `ask --scope recipe "stagger entrance"` — hero, list, word-split.

**Tests:**

- Transition + component snapshot across all three units (child/word/letter).
- Reduced-motion test.
- Rule detector positive + negative.

**Risk:** Medium. New public API. Commit to naming (`Enter`, `Stagger`) before shipping.

**Status:** HYBRID (BAKE + CHECK + RECIPE).

---

## 8. Make Exit Animations Subtle

**Article:** Exit shouldn't mirror enter. Fixed small offset (`-12px`) beats full container travel (`calc(-100% - 4px)`). Keep _some_ motion for direction. Spring, duration 0.45s, bounce 0.

**Current state in DryUI:**

- No Exit primitive. Svelte's built-in `fade` / `fly` are available but ad-hoc.
- Dialog / Popover / Sheet exits vary by component — no centralized subtle default.

**Gap:** Same as #7 for the exit side.

**BAKE — `leave` transition + `<Exit>` component:**

```ts
// packages/ui/src/motion/leave.ts
interface LeaveOptions {
  translate?: number;     // px; default 12 (not full container height)
  blur?: number;          // px; default 4
  duration?: number;      // ms; default resolved from --dry-duration-slow (360ms)
  easing?: (t: number) => number;
}

export function leave(node: HTMLElement, opts: LeaveOptions = {}): TransitionConfig { … }
```

Usage:

```svelte
{#if open}
	<div in:enter out:leave>…</div>
{/if}
```

Tokens:

```css
:root {
	--dry-exit-translate: 12px;
	--dry-exit-blur: 4px;
	--dry-exit-duration: var(--dry-duration-slow); /* 360ms */
	--dry-exit-ease: var(--dry-ease-out);
}
```

Wire Dialog, Popover, Sheet, Toast, DropdownMenu, ContextMenu, Tooltip, Drawer to use `leave` by default for their dismissal animation.

**CHECK — `polish/symmetric-exit-animation`:**

- Detector: find transition/animation blocks where the exit offset expression matches `calc(-100%...)`, `-100%`, or a computed full-height pattern.
- Severity: `suggestion`.
- Message: `Exit animation mirrors enter (full travel). Prefer a subtle fixed offset (~12px) so the dismissal feels softer than the introduction. Use out:leave.`

**RECIPE:** `ask --scope recipe "exit animation"`.

**Tests:** Leave transition snapshot, positive detector case, negative detector (subtle offset already used).

**Risk:** Medium. Existing overlay primitives (Dialog/Popover/etc) may have opinionated exit animations people already rely on. Gate behind a Dialog prop to keep backward compat for a release cycle.

**Status:** HYBRID (BAKE + CHECK + RECIPE).

---

## 9. Align Optically, Not Geometrically

**Article:** Icons shift content visually. Reduce padding on icon side; ideally fix inside SVG so no consumer margin.

**Current state in DryUI:**

- Button padding is uniform (`x: 4`, `y: 2.5`) with `gap: 2` between icon and label.
- Icon uses `line-height: 0` + `inline-grid center` ✓ for vertical alignment.
- No horizontal optical offset for leading icons.
- Icon set (assumed Lucide-style) isn't hand-optically-tuned per-glyph.

**Gap:** Leading-icon buttons look slightly off-center — the icon and label together are offset rightward because the icon's visual weight is smaller than its padded bounding box.

**BAKE — optical offset token + `:has()` rule on Button:**

```css
:root {
	--dry-optical-icon-offset: 0.125rem; /* 2px */
}

.dry-button:has(> .dry-icon:first-child) {
	padding-inline-start: calc(var(--dry-btn-padding-x) - var(--dry-optical-icon-offset));
}
.dry-button:has(> .dry-icon:last-child) {
	padding-inline-end: calc(var(--dry-btn-padding-x) - var(--dry-optical-icon-offset));
}
```

Apply the same rule to `Chip`, `Badge` (when icon slot present), `MenuItem`, any component with a padded shell + icon slot.

**BAKE — Icon component optical escape hatch:**

Add an optional `optical` prop to Icon:

```svelte
<Icon src={SearchIcon} optical="nudge-left" />
```

Applied as `margin-inline-start: calc(-1 * var(--dry-optical-icon-offset))` — useful when the icon set has a glyph that reads heavy and needs a manual tweak.

**CHECK:** Hard to detect without rendering. Skip a polish rule for this; the bake-in covers the common case.

**RECIPE:** `ask --scope recipe "icon in button"` documents the convention so it's discoverable.

**Tests:** Visual regression — Button with leading icon, trailing icon, both.

**Risk:** Low-medium. Slight visual shift on every existing leading-icon button. Validate via Chromatic-style diff before merging.

**Status:** BAKE + RECIPE.

---

## 10. Use Shadows Instead of Borders

**Article:** Three-layer box-shadow recipe:

```css
.border-shadow {
	box-shadow:
		0px 0px 0px 1px rgba(0, 0, 0, 0.06),
		0px 1px 2px -1px rgba(0, 0, 0, 0.06),
		0px 2px 4px 0px rgba(0, 0, 0, 0.04);
}
```

Hover raises opacity values (0.08/0.08/0.06). Transition-shadow between. Works over images / mixed backgrounds. Light-mode-only difference noted.

**Current state in DryUI:**

- `--dry-shadow-raised` / `--dry-shadow-overlay` / `--dry-shadow-sunken` / `--dry-shadow-brand` / `--dry-shadow-accent` are defined.
- `--dry-shadow-{sm,md,lg,xl}` **are defined** at `default.css:439-448` using `color-mix()` with single-layer values (not the article's 3-layer rgba stack). This is a **redefine**, not an add.
- Card uses border + shadow together (double edge).
- Separator is border-only with no shadow variant.
- Ghost/outline Button variants use border.

**Gap:** Existing shadow values are single-layer and lack the article's three-layer "edge + close contact + ambient" composition. Default Card looks flat because border defeats shadow. Separator has no shadow variant.

**BAKE — redefine the shadow scale with the article's 3-layer recipe:**

```css
:root {
	/* Shadow scale — shadow-as-border */
	--dry-shadow-sm:
		0px 0px 0px 1px rgba(0, 0, 0, 0.06), 0px 1px 2px -1px rgba(0, 0, 0, 0.06),
		0px 2px 4px 0px rgba(0, 0, 0, 0.04);

	--dry-shadow-md:
		0px 0px 0px 1px rgba(0, 0, 0, 0.07), 0px 2px 4px -1px rgba(0, 0, 0, 0.08),
		0px 4px 8px -2px rgba(0, 0, 0, 0.04);

	--dry-shadow-lg:
		0px 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 4px 8px -2px rgba(0, 0, 0, 0.08),
		0px 8px 20px -4px rgba(0, 0, 0, 0.06);

	--dry-shadow-xl:
		0px 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 8px 16px -4px rgba(0, 0, 0, 0.1),
		0px 20px 40px -8px rgba(0, 0, 0, 0.08);

	/* Hover variants (slightly darker first/second layer) */
	--dry-shadow-sm-hover:
		0px 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px -1px rgba(0, 0, 0, 0.08),
		0px 2px 4px 0px rgba(0, 0, 0, 0.06);
}

[data-theme='dark'] {
	--dry-shadow-sm:
		0px 0px 0px 1px rgba(255, 255, 255, 0.06), 0px 1px 2px -1px rgba(0, 0, 0, 0.4),
		0px 2px 4px 0px rgba(0, 0, 0, 0.3);
	/* ...corresponding md/lg/xl/-hover overrides */
}
```

**BAKE — Card default: shadow-only:**

- Remove the 1px solid border from Card's default variant.
- Default Card uses `box-shadow: var(--dry-shadow-sm)`.
- Elevated Card uses `var(--dry-shadow-md)`.
- Interactive Card hovers `var(--dry-shadow-sm-hover)` with `transition: box-shadow var(--dry-duration-fast) var(--dry-ease-out)`.
- Retain a `bordered` prop on Card.Root for the current visual (border + subtle shadow) if consumers want it back.

**BAKE — Separator shadow variant:**

- Add `variant="shadow"` to Separator that renders `height: 1px; background: transparent; box-shadow: 0 1px 0 var(--dry-color-stroke-weak-shadow);` — functionally the same but theme-friendlier on images.

**BAKE — Ghost/Outline Button:**

- Outline variant remains border-based (intentional: the visual affordance is the outline).
- Ghost variant: consider switching hover state from `background: …` to `box-shadow: var(--dry-shadow-sm)` for a subtler hover on toolbar / icon-heavy UIs.

**CHECK — `polish/solid-border-on-raised`:**

- Detector: in a style block, if a selector sets both `background: var(--dry-color-bg-raised|overlay|floating)` AND `border: 1px solid …` (anything non-transparent), flag.
- Severity: `warning`.
- Message: `Raised surface with a solid border. Prefer var(--dry-shadow-sm) for a softer edge that adapts to any background.`
- Allow comment: `<!-- dryui-allow border-on-raised -->`.

**RECIPE:** `ask --scope recipe "shadow as border"`.

**Tests:**

- Snapshot Card default in both themes.
- Shadow token values fully defined in every theme file.
- Detector positive + negative.

**Risk:** **Highest in the plan** — two compounding changes. (1) Redefining `--dry-shadow-{sm,md,lg,xl}` shifts every existing raised surface that consumes those tokens (Button, Card, and any consumer code). (2) Removing the Card default border shifts visual identity on top of that. Mitigation:

- Minor-version bump.
- Chromatic / visual regression on all Card + Button stories, plus `apps/docs` and `apps/playground`.
- Changelog entry highlighting both changes.
- A `bordered` escape hatch on Card.Root for one release to ease migration.
- Consider staging: redefine shadow scale in release N, drop Card border in release N+1, so the blast radius is isolated.

**Status:** BAKE + CHECK + RECIPE.

---

## 11. Add Outline to Images

**Article:** `1px` outline, `10%` opacity, black in light / white in dark, `outline-offset: -1px` (inset). Creates consistent edge, especially useful in design systems where other elements have borders.

**Current state in DryUI:**

- Image uses `box-shadow: inset 0 0 0 1px var(--dry-image-edge)` (`image.svelte:72`). `--dry-image-edge` defined in `default.css` (light) and overridden in `dark.css:69` and `dark.css:298` as `rgba(255, 255, 255, 0.1)` ✓.
- Avatar uses the same edge treatment (`avatar.svelte:124`).

**Gap:** Mechanism is `inset box-shadow`; article specifies `outline` + `outline-offset: -1px`. Practically near-identical visually, but:

- `outline-offset` is the intended semantic for edge overlays.
- `outline` doesn't fight with a drop-shadow if the image ever gets one.
- No equivalent on `<Video>`, `<Figure>`, or any media primitive.

**BAKE:**

```css
:root {
	--dry-image-edge: rgba(0, 0, 0, 0.1);
}
[data-theme='dark'] {
	--dry-image-edge: rgba(255, 255, 255, 0.1);
}

.dry-image,
.dry-avatar,
.dry-video,
.dry-figure img {
	outline: 1px solid var(--dry-image-edge);
	outline-offset: -1px;
}
```

Replace the inset `box-shadow` in `image.svelte` and `avatar.svelte`. Document that `--dry-image-edge` can be overridden theme-side.

**CHECK — `polish/raw-img`:**

- Detector: raw `<img\b` tag in markup without a surrounding `<Image>` / `<Avatar>` / `<Figure>` / `<picture>`.
- Severity: `suggestion`.
- Message: `Raw <img> found. Use <Image src="…"> for loading state, lazy-load defaults, and the 1px edge overlay that matches the design system.`
- Suggested fix: `Replace with <Image src="…" alt="…" />. Run: ask --scope component "Image".`

**RECIPE:** `ask --scope recipe "image edge"`.

**Tests:** Visual regression on Image/Avatar both themes; rule detector.

**Risk:** Low. Outline vs inset-box-shadow is a near-identical visual result.

**Status:** BAKE + CHECK + RECIPE.

---

# Shared Infrastructure Summary

Consolidated list of new/changed items that support multiple rules.

## New tokens (to add to `packages/ui/src/themes/default.css` and mirror in other theme files)

```css
/* Radius additions */
--dry-radius-xs: 2px;
--dry-radius-card: var(--dry-radius-2xl);
--dry-radius-dialog: var(--dry-radius-2xl);
--dry-radius-popover: var(--dry-radius-xl);
--dry-radius-sheet: var(--dry-radius-2xl);
--dry-radius-toast: var(--dry-radius-lg);
--dry-radius-tooltip: var(--dry-radius-md);

/* Container paddings (source of truth for concentric math) */
--dry-padding-card: var(--dry-space-8);
--dry-padding-dialog: var(--dry-space-6);
--dry-padding-popover: var(--dry-space-2);
--dry-padding-sheet: var(--dry-space-6);
--dry-padding-toast: var(--dry-space-3);
--dry-padding-tooltip: var(--dry-space-2);
--dry-padding-field: var(--dry-space-4);

/* Derived nested radii */
--dry-radius-nested-card: max(
	var(--dry-radius-sm),
	calc(var(--dry-radius-card) - var(--dry-padding-card))
);
--dry-radius-nested-dialog: max(
	var(--dry-radius-sm),
	calc(var(--dry-radius-dialog) - var(--dry-padding-dialog))
);
--dry-radius-nested-popover: max(
	var(--dry-radius-xs),
	calc(var(--dry-radius-popover) - var(--dry-padding-popover))
);
--dry-radius-nested-sheet: max(
	var(--dry-radius-sm),
	calc(var(--dry-radius-sheet) - var(--dry-padding-sheet))
);
--dry-radius-nested-toast: max(
	var(--dry-radius-xs),
	calc(var(--dry-radius-toast) - var(--dry-padding-toast))
);
--dry-radius-nested-tooltip: max(
	var(--dry-radius-xs),
	calc(var(--dry-radius-tooltip) - var(--dry-padding-tooltip))
);
--dry-radius-nested-field: max(
	var(--dry-radius-sm),
	calc(var(--dry-radius-md) - var(--dry-padding-field))
);

/* Shadow scale completion */
--dry-shadow-sm: /* article 3-layer */ --dry-shadow-md: /* denser */ --dry-shadow-lg: /* larger */
	--dry-shadow-xl: /* largest */ --dry-shadow-sm-hover: /* darker variant */ /* Motion additions */
	--dry-enter-translate: 8px;
--dry-enter-blur: 5px;
--dry-enter-duration: 800ms;
--dry-enter-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--dry-enter-stagger-section: 100ms;
--dry-enter-stagger-word: 80ms;
--dry-enter-stagger-letter: 40ms;
--dry-enter-stagger-max: 16;

--dry-exit-translate: 12px;
--dry-exit-blur: 4px;
--dry-exit-duration: var(--dry-duration-slow);
--dry-exit-ease: var(--dry-ease-out);

--dry-icon-swap-duration: var(--dry-duration-fast);
--dry-icon-swap-ease: var(--dry-ease-spring-snappy);
--dry-icon-swap-scale-out: 0.85;
--dry-icon-swap-blur-out: 2px;

/* Optical offset */
--dry-optical-icon-offset: 0.125rem;

/* Numeric variant (new token wrapping the already-existing .dry-tabular-nums class) */
--dry-numeric-variant: tabular-nums;

/* --dry-image-edge (light + dark override) ALREADY PRESENT — skip */
```

**Shadow scale note:** `--dry-shadow-{sm,md,lg,xl}` already exist in `default.css:439-448` with `color-mix()` single-layer values. The plan **redefines** them to the article's 3-layer rgba recipe. This is a breaking visual change for every consumer of those tokens (Button, Card, any user CSS referencing them). See rule #10 + risk register.

## Theme reset additions (`html {}` block)

```css
html {
	/* existing lines... */
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale; /* NEW */
	text-rendering: optimizeLegibility; /* NEW */
}
:where(h1, h2, h3, h4, h5, h6) {
	text-wrap: balance;
} /* NEW */
:where(p) {
	text-wrap: pretty;
} /* NEW */
```

## New primitives

| Primitive               | Path                                    | Notes                            |
| ----------------------- | --------------------------------------- | -------------------------------- |
| `IconSwap`              | `packages/ui/src/icon-swap/`            | Animated icon slot swap          |
| `Enter` (component)     | `packages/ui/src/motion/enter.svelte`   | Single-child wrapper with index  |
| `Stagger`               | `packages/ui/src/motion/stagger.svelte` | Iterates children, applies enter |
| `Exit` (wrapper)        | `packages/ui/src/motion/exit.svelte`    | Pairs with Svelte `{#if}`        |
| `enter` (transition fn) | `packages/ui/src/motion/enter.ts`       | `in:enter={{ index }}`           |
| `leave` (transition fn) | `packages/ui/src/motion/leave.ts`       | `out:leave`                      |
| `Numeric`               | `packages/ui/src/numeric/`              | Stable-width digit slot          |

## Updated primitives

| Primitive                                                                                                            | Change                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `Card.Root`                                                                                                          | Default drops border, uses `--dry-shadow-sm`; add `bordered` prop escape hatch                           |
| `Separator`                                                                                                          | Add `variant="shadow"`                                                                                   |
| `Image`                                                                                                              | Switch inset box-shadow to outline                                                                       |
| `Avatar`                                                                                                             | Switch inset box-shadow to outline                                                                       |
| `Button`                                                                                                             | `:has(> .dry-icon:first-child)` optical compensation                                                     |
| `Input`                                                                                                              | Radius uses `--dry-radius-nested-field` when inside Field.Root                                           |
| `Badge`                                                                                                              | Add `numeric` prop with tabular-nums + min-width                                                         |
| `RelativeTime`, `FormatDate`                                                                                         | Apply `.dry-tabular-nums` (FormatBytes already has it)                                                   |
| `.dry-tabular-nums` utility                                                                                          | Rewrite to consume `var(--dry-numeric-variant)` for token indirection                                    |
| All overlay primitives (Dialog, Popover, DropdownMenu, Sheet, Toast, Tooltip, ContextMenu, Menubar, Command, Drawer) | Consume `--dry-radius-<name>` and `--dry-radius-nested-<name>` instead of ad-hoc values; use `out:leave` |

---

# `--polish` Check Scope Design

## Rule catalog schema change

Extend `RuleCatalogEntry` in `packages/lint/src/rule-catalog.ts`:

```ts
export interface RuleCatalogEntry {
	readonly id: string;
	readonly message: string;
	readonly severity: 'error' | 'warning' | 'suggestion' | 'info';
	readonly suggestedFix?: string;
	readonly category?: 'correctness' | 'a11y' | 'polish'; // NEW
}
```

All existing rules default to `'correctness'` if unset. New polish rules carry `category: 'polish'`.

## Check dispatcher

In `packages/mcp/src/tools/check.ts`, extend the input to accept a `scope` filter:

```
check <path>                     # default: runs all categories
check --polish <path>            # runs only polish rules
check --no-polish <path>         # runs everything except polish (current default after this lands)
```

Implementation: pass a `categoryFilter: Set<string> | null` down into `checkStyle()`, `checkMarkup()`, `checkScript()` so they can short-circuit when a rule's category is filtered out.

## Polish rule inventory

| ID                                | Detects                                        | Severity   | Rule # |
| --------------------------------- | ---------------------------------------------- | ---------- | ------ |
| `polish/raw-heading`              | Raw `<h1>-<h6>` in markup                      | suggestion | 1      |
| `polish/raw-paragraph`            | Raw `<p>` in markup (optional, opt-in)         | info       | 1      |
| `polish/nested-radius-mismatch`   | Child uses outer radius token                  | suggestion | 2      |
| `polish/raw-icon-conditional`     | Ternary icon swap without `<IconSwap>`         | suggestion | 3      |
| `polish/missing-theme-smoothing`  | Theme CSS missing smoothing declarations       | warning    | 4      |
| `polish/numeric-without-tabular`  | Numeric-named component lacks `tabular-nums`   | suggestion | 5      |
| `polish/inter-tabular-warning`    | Inter + tabular-nums combination               | info       | 5      |
| `polish/keyframes-on-interactive` | `@keyframes` triggered by interactive selector | warning    | 6      |
| `polish/ad-hoc-enter-keyframe`    | Hand-rolled entrance keyframe                  | suggestion | 7      |
| `polish/symmetric-exit-animation` | Exit offset mirrors enter full-travel          | suggestion | 8      |
| `polish/solid-border-on-raised`   | Raised surface with solid border               | warning    | 10     |
| `polish/raw-img`                  | Raw `<img>` without `<Image>` wrapper          | suggestion | 11     |

12 rules, mapped to 10 of the 11 article principles. Only rule 9 (optical alignment) has no practical static check — it's pure bake-in. Rule 4 has a workspace-scope check (`polish/missing-theme-smoothing`); rule 6 (interruptibility) is partially checkable via the interactive-selector heuristic.

## Fix-guidance tone

All polish messages follow the pattern:

```
<what was found>. <why it matters (one clause)>. <what to do, with primitive name or token>.
```

Example:

```
Raw <img> found. Misses the edge-overlay that matches every other surface in the design system.
Use <Image src="…" alt="…" />.
```

## Severity policy

- `error`: never (polish is by definition non-blocking).
- `warning`: when the fix is unambiguous and the current state is a clear regression (solid border on raised surface, missing theme smoothing, keyframes on interactive).
- `suggestion`: default for polish rules. Agents see it; don't block CI.
- `info`: optional signals (Inter tabular warning).

## Allow comments

Every polish rule honors `<!-- dryui-allow <rule-suffix> -->` on the containing line (the existing `hasAllowComment` infrastructure already supports this pattern).

---

# Phased Rollout

### Phase 1 — Low-risk tokens + reset (day 1, additive + reset tweaks)

Commit one: touch only theme CSS + reset. Not zero-risk because raw-tag reset rules and `text-rendering` apply globally — but additive and easy to revert.

- Add radius/padding/motion/optical/numeric tokens listed above.
- Add `-moz-osx-font-smoothing: grayscale` to theme reset.
- Add `text-rendering: optimizeLegibility` (user-visible on every text node — see R3; scope to `:where(h1,h2,h3,h4)` if a Lighthouse regression surfaces).
- Add `:where(h1…h6) { text-wrap: balance }` and `:where(p) { text-wrap: pretty }` — user-visible on raw markup.
- Add new nested-radius tokens (no primitives consume them yet; invisible).

**Deferred to Phase 2 (has its own high-risk track):** redefining `--dry-shadow-{sm,md,lg,xl}` to article's 3-layer recipe — shifts every existing shadow consumer, so pair with Card border change.

**Verified already done (skip):** dark-mode `--dry-image-edge` override is present at `dark.css:69` and `dark.css:298`.

### Phase 2 — Primitive adoptions (follow-up PRs, per-component, visual-reviewed)

Each of these is a separate PR with a Chromatic-style visual check:

1. **Image/Avatar** — switch to `outline` + theme-aware edge.
2. **Button** — `:has()` optical-offset rule.
3. **Overlay primitives** — consume `--dry-radius-<name>` and `--dry-radius-nested-<name>`; use `out:leave`.
4. **Card** — drop default border (the one high-risk change; dedicated PR with migration notes).
5. **Separator** — add `variant="shadow"`.
6. **Input** — adopt nested radius inside Field.
7. **RelativeTime / FormatDate** — apply `.dry-tabular-nums` (FormatBytes already has it).
8. **Badge** — `numeric` prop.

### Phase 3 — New primitives

1. `Numeric` (trivial).
2. `IconSwap` + retrofit Collapsible / Accordion chevrons.
3. `enter` / `leave` transition functions.
4. `Enter` / `Exit` / `Stagger` components.

Each primitive ships with: recipe in `ask`, component doc page in `apps/docs`, unit test + visual regression, reduced-motion story.

### Phase 4 — `--polish` check scope

1. Extend `RuleCatalogEntry` with `category`.
2. Add 12 polish rules with detectors in `rules.ts`.
3. Extend `check` dispatcher with `--polish` / `--no-polish` scope filters.
4. Tests for every detector (positive, negative, allow-comment).
5. Update `MCP` tool description so agents know `--polish` exists.

### Phase 5 — Docs + skill parity

1. `ask --scope recipe` entries for each pattern.
2. New docs page `/docs/polish-pass` mirroring the 11 principles + the DryUI mapping.
3. Optional: publish a thin `@dryui/polish-skill` that wraps the same principles as a Claude skill for users outside the DryUI primitive graph.

---

# Risk Register

| #   | Risk                                                                           | Likelihood | Severity | Mitigation                                                                                         |
| --- | ------------------------------------------------------------------------------ | ---------- | -------- | -------------------------------------------------------------------------------------------------- |
| R1  | Card default losing border shifts brand look across every consumer             | High       | High     | Gate behind `bordered` prop; minor-version bump; visual regression review; changelog call-out      |
| R2  | Input nested radius inside Field visibly changes form styling                  | Medium     | Medium   | Opt-in via Field `nestRadius={true}` for one release, then default                                 |
| R3  | New `text-rendering: optimizeLegibility` hurts perf on text-heavy pages        | Low        | Medium   | Scope to headings only (`:where(h1,h2,h3,h4)`) if Lighthouse regresses                             |
| R4  | Button leading-icon optical offset clashes with existing label layouts         | Medium     | Low      | Ship with `data-optical="off"` escape hatch on Button                                              |
| R5  | Enter/Exit/Stagger API churn after initial release                             | Medium     | Medium   | Iterate in `apps/playground` for a sprint before exporting; freeze API before 1.0                  |
| R6  | `polish/*` rules flood diagnostics on existing codebases                       | High       | Low      | Default to `suggestion` severity; provide `--no-polish` flag; document bulk allow-comment workflow |
| R7  | Image `outline` vs `box-shadow` render difference on rounded corners in Safari | Low        | Low      | Spot-check on Safari; fall back to inset shadow if a known rendering bug surfaces                  |
| R8  | Shadow scale values in dark mode wash out on OLED pure-black                   | Medium     | Low      | Tune via dark-theme override (higher opacity white-cast for edge, lower rgba(0,0,0) on layers)     |

---

# Open Questions

1. **`--polish` as default-on or opt-in?** Current plan: always run, just filtered by severity. Agents see `suggestion` diagnostics. An alternative is default-off, opt-in via `--polish`, so CI stays quiet. Recommend default-on with `suggestion` severity, because that's how it will actually influence agent output.
2. **Ship a `@dryui/polish-skill`?** Jakub's skill is prompt-level; ours would be redundant for DryUI users (primitives cover it) but useful for non-DryUI consumers. Defer until Phase 5.
3. **Motion primitive positioning vs existing `Reveal`.** `Reveal` already exists at `packages/ui/src/reveal/`. Options: (a) extend `Reveal` to take an `index` prop and ship `Stagger` as a container over many `Reveal`s, (b) introduce `Enter`/`Exit`/`Stagger` alongside `Reveal` with clear scope split (e.g. Reveal = on-viewport, Enter = on-mount), (c) merge and deprecate. Read `reveal.svelte` scope before Phase 3.
4. **Should `Numeric` exist or is the existing `.dry-tabular-nums` class enough?** The class is the easy path. Primitive gives agents a clearer target and solves `min-width` stability for counters. Lean yes on shipping.
5. **Dark-mode shadow values.** The article only notes "difference is only noticeable in light mode". Our dark-mode shadow scale needs independent tuning; the rgba(255,255,255,0.06) edge approximation needs visual review.
6. **Reduced-motion contract.** Specify globally: every motion primitive drops duration to `1ms` under `prefers-reduced-motion: reduce`. Confirm before Phase 3.

---

# Appendix A — File Change Map

```
packages/ui/src/themes/default.css                  # reset + all new tokens
packages/ui/src/themes/dark.css                     # dark overrides (shadow, image-edge)
packages/ui/src/themes/midnight.css                 # same
packages/ui/src/themes/aurora.css                   # same
packages/ui/src/themes/terminal.css                 # same

packages/ui/src/card/card-root.svelte               # drop default border; consume shadow token
packages/ui/src/separator/separator.svelte          # add shadow variant
packages/ui/src/image/image.svelte                  # outline instead of inset shadow
packages/ui/src/avatar/avatar.svelte                # same
packages/ui/src/button/button.svelte                # :has() optical offset
packages/ui/src/input/input.svelte                  # nested radius inside Field
packages/ui/src/badge/badge.svelte                  # numeric prop
packages/ui/src/relative-time/relative-time.svelte  # tabular-nums
packages/ui/src/format-date/format-date.svelte      # tabular-nums
packages/ui/src/format-bytes/format-bytes.svelte    # tabular-nums
packages/ui/src/field/field-root.svelte             # sets --dry-input-radius in context
packages/ui/src/dialog/**                           # radius tokens + out:leave
packages/ui/src/popover/**                          # same
packages/ui/src/dropdown-menu/**                    # same
packages/ui/src/sheet/**                            # same
packages/ui/src/toast/**                            # same
packages/ui/src/tooltip/**                          # same
packages/ui/src/context-menu/**                     # same
packages/ui/src/menubar/**                          # same
packages/ui/src/command/**                          # same
packages/ui/src/drawer/**                           # same

packages/ui/src/icon-swap/icon-swap.svelte          # NEW
packages/ui/src/motion/enter.ts                     # NEW transition fn
packages/ui/src/motion/leave.ts                     # NEW transition fn
packages/ui/src/motion/enter.svelte                 # NEW component
packages/ui/src/motion/exit.svelte                  # NEW component
packages/ui/src/motion/stagger.svelte               # NEW component
packages/ui/src/numeric/numeric.svelte              # NEW

packages/lint/src/rule-catalog.ts                   # add 12 polish rules + category field
packages/lint/src/rules.ts                          # detectors
packages/lint/src/rules.test.ts                     # tests per detector

packages/mcp/src/tools/check.ts                     # --polish / --no-polish scope filter
packages/mcp/src/component-checker.ts               # pass category filter through

apps/docs/src/routes/docs/polish-pass/+page.svelte  # NEW docs page
```

# Appendix B — Detector Regex Library

**Source of truth for detector patterns.** Rule sections 1–11 describe each detector in prose; this appendix is the normative reference to drop into `packages/lint/src/rules.ts`. If the two diverge, this block wins.

```ts
// polish/raw-heading
const RAW_HEADING_RE = /<(h[1-6])\b[^>]*>/g;

// polish/raw-img
const RAW_IMG_RE = /<img\b[^>]*>/g;

// polish/raw-paragraph (opt-in)
const RAW_P_RE = /<p\b[^>]*>/g;

// polish/keyframes-on-interactive (two-pass)
const KEYFRAMES_NAME_RE = /@keyframes\s+([\w-]+)/g;
const INTERACTIVE_SELECTORS =
	/[:\[](?:hover|focus|focus-visible|active|data-state="(?:open|closed)"|aria-expanded=|data-open|data-collapsed)/;

// polish/ad-hoc-enter-keyframe (match by name or by body contents)
const ENTER_KEYFRAME_NAME_RE =
	/@keyframes\s+(fadeIn|slideUp|slideIn|enter|reveal|stagger|appear)\b/i;

// polish/solid-border-on-raised (paired style declarations)
const RAISED_BG_RE = /background\s*:\s*var\(--dry-color-bg-(?:raised|overlay|floating)\)/;
const SOLID_BORDER_RE = /border\s*:\s*1px\s+solid/;

// polish/symmetric-exit-animation
const FULL_TRAVEL_EXIT_RE =
	/(?:y|translateY|translate)\s*:\s*(?:"|')?\s*(?:calc\(\s*-100%\s*(?:[-+]\s*\d+px\s*)?\)|-100%)/;

// polish/numeric-without-tabular (file-name heuristic)
const NUMERIC_FILENAME_RE = /\b(timer|clock|countdown|count|score|price|meter)\b.*\.svelte$/i;
const TABULAR_NUMS_RE = /font-variant-numeric\s*:\s*tabular-nums|\.dry-tabular-nums\b/;

// polish/nested-radius-mismatch (coarse — in-file parent-uses + child-uses-same-token)
const OUTER_RADIUS_SET_RE =
	/--dry-(?:card-radius|radius-(?:card|dialog|popover|sheet|toast|tooltip))\s*:/;
const CHILD_USES_OUTER_RE =
	/(\.inner|\.content|\.item)[^{]*\{[^}]*border-radius\s*:\s*var\(--dry-radius-(?:2xl|xl|lg)\)/;

// polish/raw-icon-conditional (ternary icon)
const TERNARY_ICON_RE =
	/\{\s*\w+\s*\?\s*<([A-Z]\w*(?:Icon|Icn))\b[^>]*\/?>\s*:\s*<([A-Z]\w*(?:Icon|Icn))\b[^>]*\/?>\s*\}/;
```

# Appendix C — Comparison with `jakubkrehel/make-interfaces-feel-better`

| Aspect       | jakub's skill                                     | DryUI polish pass                                      |
| ------------ | ------------------------------------------------- | ------------------------------------------------------ |
| Mechanism    | Prompt-level guidance loaded via `npx skills add` | Primitives + tokens + `check --polish`                 |
| Scope        | Any codebase the agent works in                   | DryUI consumers primarily                              |
| Trigger      | `/skill make-interfaces-feel-better`              | Automatic (primitives) + `check --polish`              |
| Failure mode | Agent forgets to apply                            | Structurally hard to skip                              |
| Coverage     | All 11 as guidance                                | 8 as bake-in, 10 as check, remaining 3 as pure bake-in |
| Portability  | Works without DryUI                               | Requires DryUI import                                  |

Both approaches are valid and complementary. A future `@dryui/polish-skill` prompt package could bridge both worlds for codebases that haven't adopted DryUI yet.
