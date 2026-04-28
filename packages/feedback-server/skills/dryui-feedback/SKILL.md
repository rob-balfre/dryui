---
name: dryui-feedback
description: 'Apply a single DryUI feedback submission. Use whenever you have a submission id from the feedback widget, a `feedback_get_submissions` payload, a screenshot annotated with arrows/text/components/region boxes, or a request like "act on submission X" / "resolve this feedback" / "the user drew a box on the page and labelled it Y". The skill covers reading the submission, decoding the five intent kinds (drawings / components / removed / moved / layoutBoxes), the AreaGrid no-gap rule, the lint trip-wires that block the dev server, and the resolve handshake.'
---

# DryUI Feedback

Single job: take **one** feedback submission and apply the smallest change that satisfies it. Read the screenshot, decode the structured intents, edit the source, run check, mark resolved. Stop.

## The submission shape

A submission is a JSON object (fetch with MCP `feedback_get_submissions` or `curl http://127.0.0.1:4748/submissions`):

```
id, url, viewport, scroll
screenshotPath: { png, webp }    ← read png; fall back to webp if png is empty
drawings[]                       ← annotations the user drew
hints[]                          ← parallel array: each drawing's nearest element + position
components[]                     ← components the user added through the inspector
removed[]                        ← elements the user removed
moved[]                          ← elements the user dragged to a new position
layoutBoxes[]                    ← free-drawn rectangles labelling new regions
```

The screenshot is the most direct signal — open it before reading any structured data. Everything else exists to disambiguate what you're seeing.

## Decoding the five intent kinds

Each submission can carry zero or more of these. Treat them as instructions, not suggestions.

### `drawings[]` — annotations

Each entry has a `kind` (`freehand` / `arrow` / `text` / `eraser`) and coordinates. Treat **`text` notes as direct user instructions** — they're literal sentences the user typed onto the page (e.g. "more padding here", "make this blue", "remove this"). Pair each text note with the nearest `hints[i]` entry to find which DOM element it points at: `hints[i].element` gives the tag/selector/text content, `hints[i].corner` and `hints[i].percentX/Y` say where on the screenshot the mark sits.

Arrows usually point _from_ a label _to_ the thing being modified. Freehand sketches mark a region without naming it — combine with the screenshot to figure out what's circled.

### `components[]` — additions

Each entry: `{ kind, label, props, rect }`. The user picked a DryUI component (e.g. "Card", "Button") and dropped it at `rect` (viewport coordinates). Apply by inserting that component into the source at the closest matching DOM ancestor, with the user's `label` and `props`.

### `removed[]` — deletions

Each entry: `{ tag, selector?, rect }`. The user wants this element gone. Remove the corresponding source node. If the surrounding area becomes empty, leave it empty — don't backfill. The user can ask for a replacement in a follow-up submission.

### `moved[]` — repositions

Each entry: `{ tag, selector?, originalRect, currentRect }`. The user dragged an element from `originalRect` to `currentRect` (viewport coordinates). The screenshot shows a solid blue outline at the new position and a dashed blue ghost at the original position so you can see the displacement at a glance. Treat this as a layout intent — the user wants the element to live where the solid outline sits. Most cases hand off to `dryui-layout` (it usually means a different grid area or template-areas slot); apply directly only if the move clearly fits an existing sibling slot.

### `layoutBoxes[]` — new regions

Each entry: `{ id, label, pageX, pageY, width, height }`. The user free-drew a rectangle on top of the page and gave it a name. The cyan rectangle in the screenshot is the visual cue. The rect is in **page** coordinates (subtract `scroll` to get viewport coordinates).

This is a **layout intent**: the user wants a new named region in the AreaGrid template. You have two paths:

1. **Hand off to `dryui-layout`** if the change is structural (new template-areas variant, breakpoint shift, new track). The Layout agent owns the template family.
2. **Apply directly** if the box clearly fits an existing area pattern (e.g., the user drew a box where a sibling area already exists, just bigger or labelled differently).

Default to handing off — the Layout agent is fast and the structural rules are subtle.

## The AreaGrid spacing rules (read this before touching CSS)

`AreaGrid.Root` has **no `gap` and no `padding=` shorthand attributes** by design. Both lint hard:

- `dryui/area-grid-no-gap` — fires on any `gap`, `column-gap`, `row-gap` set on the grid.
- `dryui/area-grid-no-padding` — fires on the bare `padding=` Svelte attribute.

There are two layers of _namespaced_ padding that are allowed and meant for outer breathing room:

- `--dry-area-grid-shell-padding[-block|-inline]` — gutter inside the centered max-width cap, outside the grid tracks. Use for vertical air around a page's grid.
- `--dry-area-grid-padding[-block|-inline]` — inset between the grid box and its tracks. Use when every region should be inset from the grid edge by the same amount.

What stays banned is **inter-region spacing on the grid itself**. There is no `gap` and no shorthand `padding=`. Spacing _between_ two regions is each region's surface concern — its own border, padding, and background. If feedback says _"more breathing room around the page"_ → reach for shell padding. If it says _"more space between filters and main"_ → that's a region-surface change (Card padding, etc.), not a grid concern.

Use the `--dry-space-*` token scale: `--dry-space-2` (8px), `--dry-space-3` (12px), `--dry-space-4` (16px), `--dry-space-6` (24px), `--dry-space-8` (32px). Pick by feel from the screenshot — usually `4` or `6` for body content, `2` or `3` for compact UI, `8` for hero-style breathing room.

```svelte
<!-- WRONG: lint blocks both of these -->
<AreaGrid.Root gap="md" padding="lg">…</AreaGrid.Root>

<!-- RIGHT (outer breathing): namespaced shell or grid padding -->
<AreaGrid.Root
	--dry-area-grid-shell-padding-block="var(--dry-space-6)"
	--dry-area-grid-template-areas="…">…</AreaGrid.Root
>

<!-- RIGHT (inter-region): padding on the surface inside each area -->
<AreaGrid.Root --dry-area-grid-template-areas="…">
	<aside class="filters">…</aside>
</AreaGrid.Root>

<style>
	.filters {
		padding: var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
	}
</style>
```

## Lint trip-wires that will block the dev server

The DryUI lint runs as a Vite preprocessor — violations crash the dev server with a stack trace, so the user sees a red overlay instead of their page. Avoid every one of these when editing:

- `dryui/no-width` — no `width:` / `inline-size:` (or `min-/max-` variants). Grid children are sized by their track. Use `grid-template-columns: 16rem auto` on the parent, not `inline-size: 16rem` on the child. The only allowed unit family is the typographic measure (`ch`, `em`, `ex`).
- `dryui/no-global` — no `:global(...)` selectors. Use scoped CSS, data-attributes, or CSS variables.
- `dryui/no-inline-style` — no `style="..."` attributes. Use scoped classes or CSS variables.
- `dryui/no-style-directive` — no `style:foo={bar}` directives.
- `dryui/no-raw-native-element` — use DryUI components, not raw HTML, for anything DryUI covers.

## Component preferences (avoid lint and stay on-brand)

| Reach for                  | Not                       |
| -------------------------- | ------------------------- |
| `<Heading level>`          | `<h1>`–`<h6>`             |
| `<Text>`                   | `<p>` / `<span>` for body |
| `<Button>`                 | `<button>`                |
| `<Input>`                  | `<input type="text">`     |
| `<Slider>`                 | `<input type="range">`    |
| `<Select>`                 | `<select>`                |
| `<Checkbox>`               | `<input type="checkbox">` |
| `<Separator>`              | `<hr>`                    |
| `<Field.Root>` + `<Label>` | unlabelled form inputs    |

Raw HTML is permitted only for semantic landmarks (`<header>`, `<nav>`, `<aside>`, `<main>`, `<footer>`, `<section>`, `<article>`) and for content the DryUI surface doesn't cover (`<ol>`, `<ul>`, `<li>`, `<a>`).

## Restraint

You're applying **one** submission. Do only what the feedback asks for:

- Don't refactor adjacent code that wasn't called out.
- Don't reformat the whole file.
- Don't "improve" things the user didn't mention.
- Don't add tests, comments, or docs unless the feedback explicitly asks.
- Match the file's existing patterns — if it uses `Heading level={3}` for section headers, your additions should too.

If the feedback is ambiguous, prefer the smaller change. The user can always send another submission.

## Hand-off table

| Feedback shape                                                                      | Hand off to            |
| ----------------------------------------------------------------------------------- | ---------------------- |
| Structural layout change (new region, new template-areas variant, breakpoint shift) | `dryui-layout`         |
| Pure design tokens / theme decisions                                                | (theme agent — coming) |
| Forms wiring / a11y / focus / keyboard                                              | (forms agent — coming) |
| Microcopy or content-only edits                                                     | apply directly         |
| Padding / spacing / colour / size on existing element                               | apply directly         |
| Component swap (e.g., raw `<button>` → `<Button>`)                                  | apply directly         |
| Adding a component the user explicitly placed via `components[]`                    | apply directly         |
| Removing an element via `removed[]`                                                 | apply directly         |
| Moving an element via `moved[]` (different grid area / template slot)               | `dryui-layout`         |
| Moving an element via `moved[]` (clearly fits an existing sibling slot)             | apply directly         |

Erring towards "apply directly" is usually right for single-region tweaks. Hand off when the change touches the AreaGrid template family or breakpoint logic.

## Workflow

1. **Get the submission.** Use MCP `feedback_get_submissions` (preferred) or `curl http://127.0.0.1:4748/submissions/<id>`.
2. **Read the screenshot.** Use the `Read` tool on `screenshotPath.png`. This is the ground truth.
3. **Locate the page in source.** The submission's `url` maps to a route. For `http://localhost:5174/foo` that's `src/routes/foo/+page.svelte`. For the index, `src/routes/+page.svelte`.
4. **Pair drawings with hints.** For each `drawings[i]`, look at `hints[i].element` to find the DOM target, and `hints[i].corner` + `hints[i].percentX/Y` for sub-element placement.
5. **Apply intents.** In order: `drawings` (text notes are instructions), `components` (additions), `removed` (deletions), `moved` (repositions — usually hand off to `dryui-layout`), `layoutBoxes` (regions — usually hand off). Make the smallest source edit that satisfies each.
6. **Run lint.** `dryui check <changed-file>` (or `bun --filter @dryui/cli check <path>`). Fix any violations the edit introduced — re-read this skill's lint section if confused.
7. **Resolve.** Call MCP `feedback_resolve_submission` with the submission id, or `curl -X PATCH http://127.0.0.1:4748/submissions/<id> -H "Content-Type: application/json" -d '{"status":"resolved"}'`. The dashboard depends on this to clear the submission from the queue.

## Tone

Quiet. State the submission id and what intents it carries. Make the edit. Run check. Resolve. The user already wrote the feedback — don't re-explain it back to them.
