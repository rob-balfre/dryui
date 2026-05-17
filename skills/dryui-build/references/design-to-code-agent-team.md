# Design-to-Code Agent Team Handoff

Use this when a parent agent coordinates multiple subagents for a DryUI design-to-code build. The parent owns sequencing, shared primitives, scope boundaries, and final acceptance.

## Non-negotiables

- Do not start page workers until the foundation pass is accepted by the parent.
- Every worker gets an explicit write scope. Files outside that scope are read-only.
- Page workers do not change shared primitives, theme setup, lint config, package config, or global layout contracts. They request a parent/foundation follow-up instead.
- Every worker checks DryUI component metadata before using or changing a component API.
- Page workers inherit the dryui-build component-discovery checklist before inventing app chrome, cards, chips, badges, avatars, callouts, or navigation.
- No worker disables lint, adds ignore comments, removes `@dryui/lint`, weakens config, or bypasses DryUI rules to make a design fit.
- All page-level grid and flex layout lives in `src/layout.css`, scoped by specific `data-layout` and `data-layout-area` names.
- Final acceptance requires a visual QA pass with screenshots and bounding-box checks across mobile, tablet, and desktop.

## Parent Sequence

1. Read the design and identify shared foundation work:
   - Route shell names and top-level areas.
   - Shared app chrome, navigation, panels, cards, forms, and repeated row/list shapes.
   - DryUI primitives likely needed.
   - Files that should be shared versus page-owned.
2. Assign exactly one foundation worker first.
3. Review the foundation worker output against the Foundation Acceptance checklist.
4. Only after acceptance, fan out page workers with disjoint write scopes.
5. Merge page worker outputs one at a time, checking that no worker touched another worker's scope.
6. Run deterministic validation.
7. Assign a final visual QA worker or perform the visual QA pass yourself.
8. Accept only after screenshot review and bounding-box checks pass.

## Foundation Acceptance

The parent must verify all items before page workers begin:

- Theme CSS import order is correct: DryUI theme CSS first, local app CSS next, `src/layout.css` last.
- `src/layout.css` exists for the app and owns page/section grid declarations.
- Route shell contracts are named and stable, for example `dashboard-shell`, not generic names like `wrapper` or `container`.
- Top-level page areas are declared before implementation work starts: usually `topbar`, `navigation`, `primary`, and optional `secondary`.
- Shared layout primitives are declared once with specific names, for example `metric-grid`, `panel-stack`, `toolbar-cluster`, or route-specific variants.
- Shared visual tokens are minimal, named, and do not invent `--dry-*` variables.
- DryUI component APIs were checked from metadata or source before use.
- Component discovery covered app chrome, cards/surfaces, chips/badges, avatars/identity, callouts/feedback, forms, and navigation; missing primitives have documented fallbacks.
- Form controls are wrapped in `Field.Root` with `Label`; icon-only buttons have `aria-label`; avatars have `alt` and `fallback`.
- No lint rules, plugins, config, or ignore comments were weakened.
- A foundation proof route, fixture, or screenshot shows shared primitives together before page fanout: shell, app chrome/navigation, representative cards/panels, status chips/badges, avatar/identity, callout/alert, and form/search controls when the design uses them.
- The visual proof is screenshot-based; SSR output, text presence, or passing build alone is not foundation acceptance.
- Validation for the foundation scope ran, or the worker reported exactly why it could not run.

## Write Scope Contract

Give every worker this contract:

```text
Write scope you own:
- <file or directory>
- <file or directory>

Read-only context:
- <shared foundation files>
- <neighboring route files>
- <component metadata/source files>

Do not edit:
- Files outside your write scope.
- Lint, build, package, lockfile, or formatter config.
- Shared primitives or `src/layout.css`, unless your write scope explicitly includes them.
- Another worker's route, component, style, test, or asset files.

If you need a shared change, stop and report:
- The file you need changed.
- The exact change requested.
- Why your owned scope cannot solve it safely.
```

## Worker Output Contract

Each worker should finish with:

- Files changed.
- Component metadata checked.
- Validation run and result.
- Screenshots reviewed, if visual work was in scope.
- Scope issues or shared changes requested.

## Copyable Prompt: Foundation Worker

```text
You are the foundation worker for a DryUI design-to-code build.

Goal:
Create the shared foundation that page workers will build on. Do not implement full pages beyond the minimum needed to prove the shell and shared primitives.

Write scope you own:
- <app root>/src/routes/+layout.svelte
- <app root>/src/app.css
- <app root>/src/layout.css
- <shared component files, if any>

Read-only context:
- The design/mockup and parent notes.
- Existing route files.
- DryUI skill instructions.
- DryUI component metadata and source.

Required workflow:
1. Inspect existing app patterns and DryUI usage.
2. Check DryUI component metadata before selecting primitives. Use the skill's `check-component.mjs` helper or inspect `packages/ui/src/<component>/<component>.meta.ts`, `index.ts`, and source.
3. Run the dryui-build component-discovery checklist for app chrome/navigation, cards/surfaces, chips/badges, avatars/identity, callouts/feedback, and forms/search before inventing shared primitives.
4. Define route shell names and top-level layout areas.
5. Put page-level grid/flex only in `src/layout.css`, scoped to specific `data-layout` and `data-layout-area` names.
6. Keep `src/app.css` for visual paint only.
7. Import DryUI theme CSS before local CSS, and import `src/layout.css` last.
8. Add only shared primitives that at least two page workers need.
9. Do not disable lint, add ignore comments, weaken config, or bypass DryUI rules. If lint blocks the design, use the dryui-build recovery loop and report the smallest shared change needed.
10. Produce visual proof of the shared primitives together before page workers start.

Acceptance checklist:
- Stable shell and area names are documented in your final note.
- `src/layout.css` declares the shared layout contract page workers must use.
- Component APIs were verified from metadata/source.
- Shared primitives have screenshot proof in context before fanout.
- Accessibility requirements are built into shared primitives.
- Validation ran, or you reported the exact blocker.

Final response format:
- Files changed:
- Shell/layout contracts:
- Component metadata checked:
- Visual proof:
- Validation:
- Page-worker instructions:
- Blockers or requested parent decisions:
```

## Copyable Prompt: Page Implementation Worker

```text
You are a page implementation worker for a DryUI design-to-code build.

Goal:
Implement only your assigned page/section using the accepted foundation. Do not change shared contracts.

Write scope you own:
- <route file or directory>
- <route-local component files, if any>
- <route-local tests, if any>

Read-only context:
- `src/routes/+layout.svelte`
- `src/app.css`
- `src/layout.css`
- Shared components from the foundation pass.
- DryUI component metadata and source.
- Neighboring route examples.

Do not edit:
- `src/layout.css`, unless the parent explicitly added it to your write scope.
- Theme setup, lint config, build config, package files, or lockfiles.
- Shared components from the foundation pass.
- Files owned by another page worker.

Required workflow:
1. Re-read the accepted foundation notes before editing.
2. Check DryUI component metadata before using each primitive or prop. Use `check-component.mjs` or inspect component `.meta.ts`, `index.ts`, and source.
3. Apply the dryui-build component-discovery checklist before adding app chrome, card, chip, badge, avatar, callout, or navigation markup not already covered by the foundation.
4. Use the accepted `data-layout` and `data-layout-area` contracts. Add route-local hooks only inside your owned files.
5. Use DryUI primitives instead of raw native controls when a primitive exists.
6. Keep page-level grid/flex out of route `<style>` blocks.
7. Do not use `class=` on DryUI components unless metadata confirms it is supported.
8. Do not add lint ignores, disable lint, weaken rules, or add broad `dryui-allow` comments. If lint blocks the slice, follow the dryui-build recovery loop and request a shared change when needed.
9. If the design needs a shared primitive or layout change, stop and request it from the parent instead of editing shared files.

Acceptance checklist:
- Your page matches the assigned design slice.
- Text wraps without clipping or overlap at mobile, tablet, and desktop widths.
- Interactive controls use accessible names and correct semantics.
- Component APIs were verified from metadata/source.
- Any new primitive-shaped UI passed the component-discovery checklist or is documented as a route-local fallback.
- Validation ran for your changed files, or you reported the exact blocker.

Final response format:
- Files changed:
- Design slice implemented:
- Component metadata checked:
- Validation:
- Screenshots reviewed:
- Shared changes requested:
```

## Copyable Prompt: Visual QA Worker

```text
You are the final visual QA worker for a DryUI design-to-code build.

Goal:
Review the assembled implementation against the design after all foundation and page workers have finished. Prefer findings with file/line references and concrete fixes.

Write scope you own:
- None by default. Read and report only, unless the parent explicitly assigns a fix scope.

Read-only context:
- The target design/mockup.
- Final implemented route files.
- `src/layout.css`
- `src/app.css`
- Shared components.
- DryUI component metadata and source.

Required workflow:
1. Run or open the app using the parent-provided command.
2. Capture screenshots at mobile, tablet, and desktop sizes.
3. Compare each screenshot to the design for layout, density, visual hierarchy, token use, and responsive behavior.
4. Perform bounding-box checks for:
   - Text clipping, truncation, and overlap.
   - Buttons, inputs, menus, dialogs, and popovers.
   - Header, navigation, primary content, secondary panels, and repeated cards/rows.
   - Touch target spacing on mobile.
   - Overflow outside the viewport.
5. Inspect suspicious elements in DOM/CSS before reporting.
6. Check that workers did not disable lint, add ignore comments, or move layout into route styles.
7. Do not rewrite the implementation unless the parent assigned a specific fix scope.

Acceptance checklist:
- Screenshots exist for mobile, tablet, and desktop.
- Bounding-box issues are listed with selectors or file references.
- Missing states or accessibility regressions are listed.
- Any required fixes are split by owner: foundation, page worker, or parent.

Final response format:
- Screenshots captured:
- Pass/fail summary:
- Blocking visual issues:
- Non-blocking polish:
- Bounding-box findings:
- Scope owner for each fix:
```

## Parent Merge Checklist

Before accepting the combined work:

- `git status --short` shows only expected files from assigned scopes.
- No worker touched `src/layout.css` unless assigned.
- No worker touched lint/build/package config unless assigned.
- No `svelte-ignore`, lint-disable comments, or rule weakening were introduced.
- All DryUI component usages match metadata.
- Validation commands completed or blockers are documented.
- Visual QA screenshots cover mobile, tablet, and desktop.
- Bounding-box checks found no unresolved overlap, clipping, or viewport overflow.
