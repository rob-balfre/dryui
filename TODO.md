# Docs + theme-wizard upgrade to AreaGrid + theming standards

Source: full audit on 2026-04-30 across 4 clusters (docs marketing/shell, component browser + view, theme-wizard package, theme-wizard route + previews). ~54 files. Standards: `packages/plugin/skills/dryui-layout/SKILL.md` (AreaGrid + lint rules) and `packages/ui/skills/dryui/rules/theming.md` (token discipline).

Phases run top to bottom. Within a phase, tasks are independent unless dependencies are noted. Each task ends in `dryui check <path>` passing on the file.

## Phase 1. Foundation layouts (high leverage, propagate to many pages)

These four files wrap most of the rest. Land them first so downstream migrations have a clean parent.

- [ ] `apps/docs/src/routes/+layout.svelte` (467 lines): convert docs shell to `AreaGrid.Root template="holy-grail" maxWidth="full" fill`. Map header to `masthead`, Sidebar to `nav`, content to `main`, footer to `foot`. Strip 6 raw `display: grid` blocks, all raw `<header>`/`<nav>`/`<main>`/`<footer>` wrappers, and the hex fallback `#0b0b0b` at line 401. Remove transparent `home-mini-nav` surface (replace `color-mix(... 72%, transparent)` with a solid token) or fold it into the masthead area.
- [ ] `apps/docs/src/lib/components/ViewLayout.svelte`: wrapper for every `/view/*` sandbox. Convert to `AreaGrid.Root template="stack" maxWidth="full" fill`. Toolbar to `masthead`, content to `main`. Drop `Container size="full"` and the surrounding raw shell.
- [ ] `apps/docs/src/lib/components/Configurator.svelte`: wrapper for every component-browser detail page. Convert hand-rolled `minmax(16rem, 18rem) minmax(0, 1fr)` to `AreaGrid.Root template="sidebar" --dry-area-grid-sidebar-min="16rem"`. Preview to `main`, controls to `aside`. Replace the `color-mix(... 10%, transparent)` highlight with a solid surface or radial gradient layered over an opaque token.
- [x] `packages/theme-wizard/src/components/WizardShell.svelte`: wizard chrome. Converted to `AreaGrid.Root template="stack" maxWidth="md" fill`. Extracted three region siblings (`WizardMasthead`, `WizardBody`, `WizardFooter`) so each region's internal grid sits in a separate file (one `AreaGrid.Root` per file rule). Picked `md` (48rem) to preserve original body width; StepIndicator inherits the same cap. Removed the `WizardShell.svelte` exclude from `packages/theme-wizard/svelte.config.js`. Title is now an `<h1>` instead of a `<span>`.

## Phase 2. Doctrinal rewrite

- [ ] `apps/docs/src/routes/grid-rules/+page.svelte`: page text and code samples teach raw `display: grid`, which the lint now bans. Rewrite copy to teach AreaGrid templates and `--dry-area-grid-*` namespaced vars. Update the "Lint enforcement" callout to list `dryui/no-raw-grid`, `dryui/no-raw-element`, `dryui/no-layout-component`, `dryui/no-component-class`, `dryui/area-grid-no-gap`, `dryui/area-grid-no-padding`. Convert page shell to `AreaGrid.Root template="stack"`.

## Phase 3. Token sweep (independent, parallel-safe)

- [ ] `apps/docs/src/lib/components/AgentLogo.svelte`: lift hardcoded `hsl(...)` brand colors to per-agent CSS vars with consumption-side fallbacks (`var(--dry-agent-color-claude-code, hsl(25 100% 65%))` etc.).
- [ ] `apps/docs/src/lib/components/CompetitorLogo.svelte`: same pattern as AgentLogo for the HSL agent colors at lines 76-83. Inline SVG brand-mark hex fills (Figma red, etc.) are defensible as illustration internals.
- [ ] `apps/docs/src/lib/components/ComponentScreenshotFallback.svelte`: re-author each `.stage*` and `.glass-card` as `Card.Root` with `--dry-card-*` overrides. Replace hex `#0c1220`, `#ffffff` and rgba blends with semantic tokens. The `.stage-spectrum` rgba gradient is the worst offender.
- [ ] `apps/docs/src/routes/+page.svelte` (root home): replace the 6 transparent `color-mix(... var(--dry-color-bg-raised) X%, transparent)` surfaces on `.compare-col`, `.plugin`, `.hood-claim`, `.component-chip` with solid tokens. Add `--dry-color-fill-brand-hover` pair for the CTA. (Structural conversion of this page is in Phase 5.)
- [ ] `apps/docs/src/routes/view/feedback-bounds/+page@.svelte`: drop hardcoded HSL fallbacks (`hsl(225 15% 7%)`, `hsl(220 10% 92%)`) and `60px`/`8px`/`24px` magic numbers. Use `var(--dry-color-bg-base)` + `--dry-space-*` tokens. (Structural conversion to `centered` template covered in Phase 6.)

## Phase 4. Flagship preview demos (depend on Phase 1.4 WizardShell)

These four files are what the wizard renders to showcase DryUI. They currently violate every rule the docs publicly teach.

- [ ] `apps/docs/src/lib/theme-wizard/previews/Cards.svelte`: replace `cards-grid` (hand-rolled `repeat(auto-fit, minmax(20rem, 1fr))`) with `AreaGrid.Root template="card-grid" --dry-area-grid-min-track="20rem"`. Rebuild card internals using compound `Card.Root`/`Card.Header`/`Card.Content`. Mostly mechanical.
- [ ] `apps/docs/src/lib/theme-wizard/previews/Forms.svelte`: same pattern as Cards. Replace `forms-grid` with `card-grid` template. Drop the non-public `--dry-typography-text-color` override on `.field-error`.
- [ ] `apps/docs/src/lib/theme-wizard/previews/Dashboard.svelte`: flagship `holy-grail` candidate. Convert metrics row + table card + bottom row to `AreaGrid.Root template="stack"` wrapping inner `card-grid` for metrics and a second `card-grid` for the bottom row. Replace the hand-rolled `.table` div grid with the DryUI `Table` component if available, else hand-author `template-areas`. Replace `font-size: 1.5rem` and `letter-spacing: 0.04em` with token references.
- [ ] `apps/docs/src/lib/theme-wizard/PreviewComponents.svelte` (69 raw divs, 65 `display: grid`): largest of the four. Outer mosaic to `12-span` (8/4 split for left-pair + rail). Inner workflow board to `card-grid`. Subgrid behavior is not expressible inside AreaGrid; restructure into sibling AreaGrids. Drop `--dry-rte-border` and avatar-slot `box-shadow` overrides if they bypass the surface contract.

## Phase 5. Marketing pages (depend on Phase 1.1 +layout.svelte)

Each replaces `<Container>` + `<div class="page-stack">` with `AreaGrid.Root template="stack"`. Drop `.stack-lg`/`.stack-md`/`.stack-sm` helper divs that exist solely to fake `gap`.

- [ ] `apps/docs/src/routes/+page.svelte` (root home): structural conversion. 5 page sections become sibling `AreaGrid.Root template="stack"` instances or named regions of one outer stack. Replace internal `<section>` + `<article>` + `<header>` wrappers with DryUI surfaces.
- [ ] `apps/docs/src/routes/getting-started/+page.svelte`: outer to `stack`. Collapse `.stack-lg/md/sm` divs.
- [ ] `apps/docs/src/routes/how-it-works/+page.svelte`: outer to `stack`. Drop `.diagram-shell` raw div (Card.Root already wraps the diagram).
- [ ] `apps/docs/src/routes/how-we-work/+page.svelte`: outer to `stack`. Each module-section becomes a sibling AreaGrid or stays as a `Card.Root` placed in a `card-grid`. Keep `--diagram-width` Svelte `--prop` (already correct).
- [ ] `apps/docs/src/routes/templates/+page.svelte`: outer to `stack`. Convert `.demo-frame` border/bg to `Card.Root`.
- [ ] `apps/docs/src/routes/tools/+page.svelte`: trivial. Single `<Container>` + `<div class="stack-lg">` becomes `AreaGrid.Root template="stack"`.

## Phase 6. Component browser + view sandboxes (depend on Phase 1.2 ViewLayout, Phase 1.3 Configurator)

- [ ] `apps/docs/src/routes/components/[slug]/+page.svelte`: replace stack-\* divs with `AreaGrid.Root template="stack"` per page section. Drop `<Container>` once Configurator owns its own width.
- [ ] `apps/docs/src/routes/view/components/[slug]/+page@.svelte`: convert `.preview-page` to `AreaGrid.Root template="stack"` (header to masthead, preview to main).
- [ ] `apps/docs/src/routes/view/feedback-bounds/+page@.svelte`: structural pass to `AreaGrid.Root template="centered" fill`. Token cleanup already in Phase 3.5.
- [ ] `apps/docs/src/lib/benchmarks/VisualBenchmarkScene.svelte`: outer shell to `AreaGrid.Root maxWidth="full"` with hand-authored template-areas (asymmetric header). Inner preview-grid to a sibling `AreaGrid.Root template="card-grid"` plus a custom area for the full-width-spanning panel.
- [ ] 8 configurators (mechanical sweep): `apps/docs/src/lib/configurators/{Alert,Input,Select,Dialog,Button,Tabs,Card,Badge}Configurator.svelte`. Each ends in 1-3 `<div>` preview wrappers using `display: grid; grid-template-columns: minmax(0, Xrem)`. Replace each wrapper with `AreaGrid.Root template="centered"` (or `stack`) at fixed `maxWidth`.
- [ ] `apps/docs/src/lib/components/DocsDemo.svelte`: outer to `AreaGrid.Root template="stack"` (intro to masthead, body to main, footer to foot).
- [ ] `apps/docs/src/lib/components/DocsPreviewFrame.svelte`: convert to `Card.Root` wrapper, or `AreaGrid.Root` with `--dry-area-grid-padding` + a single Card.
- [ ] `apps/docs/src/lib/components/PropsTable.svelte`: split sections into sibling `AreaGrid.Root template="stack"` blocks. Remove the `<tr><td>` injection into Table.Body and use a real `<Table.Row>` header.
- [ ] `apps/docs/src/lib/components/DocsCodeDisclosure.svelte`: small. Replace 2 raw wrapping divs with a DryUI surface.

## Phase 7. Wizard steps (depend on Phase 1.4 WizardShell)

All five steps share the same shape: outer `<section>` + card grid + optional control row. Convert each to `AreaGrid.Root template="card-grid"` (or `stack` if there is a control row).

- [ ] `packages/theme-wizard/src/steps/Personality.svelte`: outer to `card-grid`. Extract 25-div personality preview thumbnails to a `PersonalityThumb` primitive (analogous to HsbPicker's canvas being a widget primitive). Without extraction the thumb divs trip `dryui/no-raw-element`.
- [ ] `packages/theme-wizard/src/steps/BrandColor.svelte`: outer to `AreaGrid.Root template="sidebar"`. ColorPicker on `aside`, swatch+presets stack on `main`. Inner presets list to `card-grid`. Move state-dependent border on `.preset-btn` to a token override on a real `Button` or wrap thumb in `Card.Root`.
- [ ] `packages/theme-wizard/src/steps/Shape.svelte`: outer to `card-grid`. Density row to `Field.Root` + `SegmentedControl` without the `.density-control` wrapper. Keep `.shape-hint` swatches as picker-primitive elements.
- [ ] `packages/theme-wizard/src/steps/Typography.svelte`: same migration as Shape. Custom `--_stack` Svelte `--prop` on Card.Root is correct, keep it. Optionally factor the `.font-display` glyph into a `FontSample` component.
- [ ] `packages/theme-wizard/src/steps/PreviewExport.svelte`: outer to `AreaGrid.Root` with `template-areas: 'controls actions' 'scene scene'`. Replace `.preview-scene` div with a `<TokenScope>` host that accepts `bind:host` so the `$effect` token mutation has a real DOM target.
- [ ] `packages/theme-wizard/src/components/TokenPreview.svelte`: 2-col swatch + label row. Either small AreaGrid (`'swatch info'` columns: `2rem 1fr`) or a single `Card.Root` with stacked `<Text>` children.
- [ ] `packages/theme-wizard/src/components/StepIndicator.svelte`: drop the wrapping `<nav>` and `bind:this` directly to `Stepper.Root`. Otherwise the `<nav>` trips `dryui/no-raw-element` once placed inside the WizardShell masthead.

## Phase 8. Shell helpers + nav primitives

- [ ] `apps/docs/src/lib/components/Sidebar.svelte`: drop the outer `<div class="docs-sidebar">` (Sidebar.Root carries height already). Move `<div class="scroll-root">` `display: contents` into a Sidebar slot or `bind:` on Sidebar.Content.
- [ ] `apps/docs/src/lib/components/NavGroup.svelte` + `apps/docs/src/lib/components/button/nav-group-button.svelte`: hand-rolled disclosure. Replace with `Disclosure`/`Accordion` from `@dryui/ui`, or promote both files into `@dryui/ui` proper as a real compound. They are utility primitives that should not live in app code.
- [ ] `apps/docs/src/lib/components/GlobalSearch.svelte`: drop `.search-trigger`/`.search-trigger-full`/`.search-palette` wrappers. Pass `--dry-cmd-max-width` directly on `CommandPalette.Root`. Each `.search-item` two-line layout becomes a `ListItem` recipe.
- [ ] `apps/docs/src/lib/components/DocsPageHeader.svelte`: re-author with `<Heading>` + `<Text>` inside `AreaGrid.Root template="stack"`, or fold into a `<PageHeader>` compound in `@dryui/ui`. Replace `clamp(2rem, 4vw, 2.75rem)` with `--dry-type-heading-1-size`. Use `padding-block-start` not `padding-top`.
- [ ] `apps/docs/src/lib/components/DocsSectionIntro.svelte`: same pattern as DocsPageHeader. Promote to `@dryui/ui` as `SectionIntro` if reused.
- [ ] `apps/docs/src/lib/components/Logo.svelte`: replace `display: inline-grid` with a flex equivalent so it stops tripping `dryui/no-raw-grid`.

## Phase 9. Cleanup

- [ ] Delete `packages/theme-wizard/src/components/HsbPicker.svelte`. BrandColor migrated to `@dryui/ui`'s `ColorPicker`. Still exported from `packages/theme-wizard/src/index.ts:56`. Either delete the file or downgrade to internal (drop the export).
- [ ] Strip `debug` prop from the six `apps/docs/src/lib/template-demos/*Demo.svelte` files before commit (skill says debug is dev-time only). Or document explicitly that the templates page is allowed to ship with debug.
- [ ] Remove empty `<style>` block from `apps/docs/src/lib/components/CssVarsTable.svelte` (lines 32-33).
- [ ] Decide on `apps/docs/src/routes/theme-wizard/{shape,typography,preview,colour}/+page.server.ts` 301 redirects. Keep if anything links to them; delete otherwise.

## Out of scope

Already on the new model (do not touch unless theming changes): six `template-demos/*Demo.svelte`, `view/layout-trial/+page@.svelte`, `theme-wizard/+page.svelte` (route wrapper), `ThemeToggle.svelte`, `DocsCallout.svelte`, `GithubIcon.svelte`, `AlphaSlider.svelte`, `ContrastBadge.svelte`, `engine/*` (pure logic).
