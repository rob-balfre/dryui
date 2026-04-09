# DryUI Review

Honest assessment after building a flight search app (search form + results page with fare classes, airline logos, sorting) in a single session.

## The Good

- **Component quality is high.** Combobox, DatePicker, Select, SegmentedControl all just work. Keyboard nav, accessibility, dark mode theming out of the box with zero config.
- **The `compose` tool is genuinely useful.** Asking "flight search form" and getting ranked alternatives with anti-patterns saved from wrong choices early. Knowing to use DatePicker instead of `<input type="date">`, or SegmentedControl for trip type toggle, came directly from compose output.
- **Theme tokens are solid.** Dark mode worked with zero effort. The `--dry-space-*` scale is consistent and the tier system (global > semantic > component) makes sense.
- **The `review` and `lint` tools caught real issues** — raw `<button>` elements, hardcoded hex colors — that would have shipped without them.
- **Compound component pattern is well-designed** for complex components. Combobox with Input, Content, Item, Empty, Group parts gives full control where it matters.

## The Painful

### 1. Card + column alignment is a nightmare

This was the single biggest time sink. The app needed fare column headers outside the cards to align with fare tile columns inside Card.Content. Card's encapsulated padding makes this structurally impossible without hacking `calc(var(--dry-card-padding) + 1px)`.

Google Flights and Kayak avoid this by using flat rows, not cards. DryUI pushes you toward Card for everything but then Card's padding fights you when you need table-like column alignment across rows.

`Card.Content noPadding` exists but then you lose all the nice spacing. There's a missing pattern here — something like an aligned-row list where items look like cards but share column context (CSS subgrid or shared template).

### 2. The "no flexbox" rule is too dogmatic

Grid with `grid-auto-flow: column` and `justify-content: start` for a row of inline badges is strictly worse than `display: flex; gap: 8px`. It's more verbose, harder to read, and gains nothing. The rule exists for page layout (where grid is correct) but gets applied to inline flow (where flex is correct and simpler).

### 3. Semantic mismatch when forced to "use DryUI over native HTML"

The lint told me to replace fare `<button>` elements with `Button` — fine. But I also used `Avatar` for airline logos because it was the closest component. Avatar is semantically for user profiles, not brand marks. I ended up with `<Avatar fallback="SL" alt="SkyLine Airways logo" shape="square" />` which is technically accessible but conceptually wrong.

Sometimes a styled `<div>` with a theme token background is the right answer, and the tooling shouldn't penalize that.

### 4. Token discovery is hard

When lint told me to replace hardcoded colors, I had to guess at tokens like `--dry-color-fill-brand`, `--dry-color-fill-warning`. There's no way to know if those exist. The `info` tool shows component-level CSS vars but not the global palette. A `tokens` or `palette` tool that lists available `--dry-color-fill-*`, `--dry-color-text-*` etc. would solve this.

### 5. The compound API is verbose for simple cases

Select requires 5 nested components for a basic dropdown:

```svelte
<Select.Root bind:value={x}>
  <Select.Trigger>
    <Select.Value placeholder="Choose..." />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="a">Option A</Select.Item>
  </Select.Content>
</Select.Root>
```

For a complex combobox with groups and custom rendering, the compound pattern earns its weight. For "pick a sort order from 4 options," it's ceremony. A shorthand like `<Select options={[...]} bind:value={x} />` would help.

### 6. The `info` lookup tax

The skill says "never guess a component API, always verify first." Correct advice. But calling `info` for 8-10 components before writing any code means 3-4 round trips of pure lookup before producing a single line of markup. The tooling is optimized for "one component at a time" rather than "build a page."

### 7. Lint flags that don't apply

The Grid component suggestion fired on every CSS grid in the code, including grids with `grid-template-columns: auto 11rem 6rem 1fr 7rem 7rem 7rem`. No layout component can express that. The warning should detect complex grid templates and suppress itself.

## What I'd Change

1. **Add a `List.Card` or `AlignedCardList` pattern** where rows look like cards but share a column grid context (subgrid or shared template). This is the #1 pattern in e-commerce, travel, and SaaS dashboards.
2. **Relax "no flexbox" to "no flexbox for page layout."** Inline flow of badges, tags, meta text — flex is correct there.
3. **Add a token browser tool** (`tokens` or `palette`) that lists available fill, text, border, and spacing tokens with their current values.
4. **Add a `LogoMark` or `Indicator` component** for non-avatar colored icons/initials — brand marks, status indicators, category badges.
5. **Make the Grid component lint rule smarter** — skip suggestions when the grid template has more than 3 columns or uses named areas.
6. **Consider a `SimpleSelect`** or allow `Select` to accept an `options` prop as a shorthand for the common case.
7. **Batch-friendly `info`** — allow querying multiple components in one call (e.g., `info Button,Card,Select`) to reduce round trips when scaffolding a page.

## Overall

DryUI is good. The components themselves are high quality and the MCP tooling is ahead of most component libraries. The friction is mostly in the rules/skill layer being too prescriptive for real-world layouts that don't fit the happy path. The library optimizes for correctness, which is the right default, but it needs escape hatches for when the "correct" pattern (Card, Avatar, grid-only) doesn't fit the actual UI being built.
