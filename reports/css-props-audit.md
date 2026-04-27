# CSS Props Audit

Date: 2026-04-27

Scope: CSS custom properties across DryUI source, docs app, generated MCP/docs surfaces, skills, feedback UI, and primitives. Excludes `node_modules`, build output, coverage, lockfiles, and binary assets.

## Executive Summary

The CSS custom-property surface is mostly coherent. The implementation pass applied the high-confidence fixes from this audit; fallback-only hooks and unused-looking definitions remain review queues, not automatic cleanup targets.

- Canonical runtime theme tokens are defined in `packages/ui/src/themes/default.css` and `packages/ui/src/themes/dark.css`, then snapshotted by `packages/mcp/src/generate-theme-tokens.ts` into `packages/mcp/src/theme-tokens.generated.json`.
- The generated theme registry is in sync with `default.css` and `dark.css`: no missing or extra generated tokens were found.
- The initial stricter triple-check parser found 12 no-fallback unresolved names in active source. The implementation pass fixed the high-confidence runtime/source token issues and stale snippet data; the remaining no-fallback names found by the post-fix parser are prefix placeholders, examples, or test fixtures.
- There are 201 fallback-only undefined references in the stricter active-source scan and 242 in the broader usage scan. Most are intentional consumer override hooks (`var(--token, fallback)`), but they should be documented as contract props or converted to defaults if they are meant to be first-class public tokens.
- The three real duplicated-token conflicts in `dark.css` were fixed by aligning explicit dark mode and auto dark mode inverse token values.
- The canonical theming skill docs were updated to the current token vocabulary, and generated plugin skill copies were synced.
- MCP/spec/docs generated surfaces were regenerated after replacing stale `--dry-color-primary` snippets.

## Implementation Pass

Completed on 2026-04-27:

- Replaced live old aliases and stale no-fallback refs with current tokens in UI components, docs demos, theme wizard previews, feedback-server UI, MCP composition data, and generated docs surfaces.
- Added a fallback path for the private `--_preset-color` option-picker preview token.
- Aligned `dark.css` explicit dark and auto dark values for the three inverse tokens.
- Ran `bun run sync:skills` and regenerated MCP spec, contract, agent contract, architecture, theme tokens, and LLM/docs manifests.
- Post-fix targeted scan found no remaining live-source matches for the stale high-confidence names outside this report.

## Agent Team

- Definition audit: scanned declaration-like `--name:` sites, grouped by repo area, and checked duplicate/conflicting definitions.
- Usage audit: scanned `var(--name)` usage, hard unresolved references, fallback-only hooks, unused candidates, and dynamic property families.
- Docs/generated audit: checked canonical token docs, generated skill copies, MCP token registry, package exports, and existing validators.
- Main pass: reconciled the three scans, re-ran targeted checks, and wrote this report.
- Triple-check pass: re-ran a stricter parser that recognizes `setProperty(...)`, helper-based setters, `style:--x`, Svelte custom-property attributes, and `@property`. This pass supersedes the earlier hard-missing count.
- Implementation team: fixed the report's high-confidence issues across theme/docs token data, UI components, docs/feedback surfaces, generated outputs, and final validation.

## Triple-check Reconciliation

Current corrected status:

| Finding                       | Status                                                                                                                                                                                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generated registry sync       | Confirmed. `theme-tokens.generated.json` has 330 light tokens and 144 dark tokens, with no missing or extra names versus `default.css` and `dark.css`.                                                                                                                                  |
| Dark duplicate conflicts      | Initially confirmed. Fixed in the implementation pass; explicit dark and auto dark inverse token values now match.                                                                                                                                                                      |
| `aurora.css` conflict count   | Corrected from 52 to 56. These conflicts are expected because the file contains separate light and dark theme selectors.                                                                                                                                                                |
| No-fallback unresolved names  | Corrected. Strict active-source scan found 12 names. 9 are high-confidence runtime/source token issues, 1 is stale snippet data (`--dry-color-primary`), and 2 are false positives in explanatory strings (`--name`, `--x`).                                                            |
| `--_preset-color`             | Corrected. It is injected by the theme wizard through `cssVar('--_preset-color', ...)`, so it is not a global missing definition. It remains a context-dependent private-token risk because `OptionPickerPreview` has no fallback if `variant='preset'` is used without that injection. |
| Fallback-only undefined names | Corrected to 201 in the stricter active-source scan and 242 in the broader usage scan.                                                                                                                                                                                                  |

## Scan Totals

Broad repo scan:

| Metric                                                                                            | Count |
| ------------------------------------------------------------------------------------------------- | ----: |
| Scanned text files                                                                                | 2,279 |
| Unique defined custom properties, including dynamic setters and Svelte custom-property attributes | 1,222 |
| Unique CSS declaration names                                                                      | 1,123 |
| Unique dynamic `setProperty` names                                                                |   119 |
| Unique Svelte custom-property attributes                                                          |    63 |
| Unique `var(--...)` names                                                                         | 1,271 |
| Missing from broad definition set                                                                 |   240 |
| Unused by broad `var(...)` scan                                                                   |   191 |
| Duplicate declaration names                                                                       |   518 |
| Conflicting declaration names                                                                     |   417 |

Active source-focused scan, triple-check parser:

| Metric                        | Count |
| ----------------------------- | ----: |
| Source/docs files scanned     | 1,911 |
| `var(--...)` occurrences      | 7,881 |
| Unique defined names          | 1,181 |
| Unique used names             | 1,202 |
| No-fallback unresolved names  |    12 |
| Fallback-only undefined names |   201 |
| Unused candidates             |   193 |

Usage explorer source scan:

| Metric                        | Count |
| ----------------------------- | ----: |
| Source files scanned          | 2,160 |
| `var(--...)` occurrences      | 8,683 |
| Unique `var(--...)` refs      | 1,262 |
| Custom prop definitions/sets  | 3,316 |
| Unique definition/set names   | 1,176 |
| Unresolved refs               |   258 |
| Unresolved no-fallback refs   |    14 |
| Unresolved fallback-only refs |   242 |
| Unused-looking definitions    |   172 |

Theme files:

| File                                  | Declarations | Unique | Duplicate names | Conflicts |
| ------------------------------------- | -----------: | -----: | --------------: | --------: |
| `packages/ui/src/themes/default.css`  |          394 |    330 |              40 |        31 |
| `packages/ui/src/themes/dark.css`     |          288 |    144 |             144 |         3 |
| `packages/ui/src/themes/aurora.css`   |          131 |     70 |              61 |        56 |
| `packages/ui/src/themes/midnight.css` |           86 |     86 |               0 |         0 |
| `packages/ui/src/themes/terminal.css` |          108 |    108 |               0 |         0 |

Notes:

- `default.css` conflicts are expected where scoped selectors override root tokens, for example `data-dry-type-mode` and reduced-motion blocks.
- `aurora.css` conflicts are expected because the file contains separate light and dark selectors.
- `dark.css` duplicates are expected structurally because it has explicit `[data-theme='dark']` plus guarded `.theme-auto` dark blocks. The three divergent values listed below are not expected.

## Canonical Sources

Source of truth:

- `packages/ui/src/themes/default.css`
- `packages/ui/src/themes/dark.css`
- `packages/ui/src/themes/aurora.css`
- `packages/ui/src/themes/midnight.css`
- `packages/ui/src/themes/terminal.css`

Generated registry:

- `packages/mcp/src/generate-theme-tokens.ts`
- `packages/mcp/src/theme-tokens.generated.json`
- `packages/mcp/src/theme-tokens.ts`
- `packages/mcp/src/tokens.ts`

Validators:

- `packages/mcp/src/theme-checker.ts`
- `packages/mcp/src/tools/check.ts`
- `packages/mcp/src/workspace-audit.ts`

Package export coverage is present for the five UI theme CSS files and for MCP `./theme-checker`, `./workspace-audit`, and `./tokens`.

## Cleanliness Findings

### 1. Hard missing variables, fixed

These were the no-fallback unresolved references that needed action or source cleanup. The implementation pass resolved the live-source items. The stricter parser also found `--name` and `--x` in explanatory strings; those are false positives and are not listed as issues.

| Variable                        | Location                                                                       | Recommendation                                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--dry-color-bg`                | `packages/feedback-server/ui/src/app.css:9`                                    | Replace old alias with `--dry-color-bg-base`.                                                                                                      |
| `--dry-color-fill-danger`       | `apps/docs/src/lib/theme-wizard/previews/Dashboard.svelte:372`                 | Replace with current token `--dry-color-fill-error`.                                                                                               |
| `--dry-color-primary`           | `packages/mcp/src/composition-data.ts:1236`, `:4286`, `:4296`, `:4966`         | Replace stale user-facing snippets with current brand token `--dry-color-fill-brand` or `--dry-color-text-brand`, depending on the component prop. |
| `--dry-color-shadow`            | `apps/docs/src/lib/demos/ComboboxDemo.svelte:68` and six related overlay demos | Replace with `--dry-color-text-strong` in `color-mix(...)`, or consume `--dry-shadow-overlay`.                                                     |
| `--dry-color-stroke-error-weak` | `packages/ui/src/badge/badge.svelte:235`                                       | Add a semantic weak error stroke token or use `--dry-color-stroke-error` / `--dry-color-fill-error-weak`.                                          |
| `--dry-color-surface`           | `packages/feedback-server/ui/src/submission-card.svelte:473` and `:535`        | Replace old alias with `--dry-color-bg-raised` or `--dry-color-bg-overlay`, depending on intended elevation.                                       |
| `--dry-color-text`              | `packages/ui/src/slider/slider-input.svelte:253`                               | Replace with current token `--dry-color-text-strong`.                                                                                              |
| `--dry-color-text`              | `packages/feedback-server/ui/src/app.css:10`                                   | Replace old alias with `--dry-color-text-strong`.                                                                                                  |
| `--dry-color-text-danger`       | `apps/docs/src/lib/demos/DropdownMenuDemo.svelte:116`, theme wizard previews   | Replace with current token `--dry-color-text-error`.                                                                                               |
| `--dry-text-sm-line`            | `packages/ui/src/checkbox/checkbox-input.svelte:94`                            | Replace with `--dry-text-sm-leading`.                                                                                                              |
| `--workbench-bg`                | `apps/docs/src/routes/theme-wizard/+page.svelte:1518`                          | Define locally or replace with existing `--wizard-*` / `--dry-color-bg-*` token.                                                                   |

Context-dependent private-token risk:

| Variable          | Location                                                        | Recommendation                                                                                                           |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `--_preset-color` | `packages/ui/src/option-picker/option-picker-preview.svelte:80` | Fixed with a resolved fallback chain in `OptionPickerPreview`; the docs theme wizard can still inject the private token. |

### 2. Divergent duplicate dark tokens, fixed

`packages/ui/src/themes/dark.css` defines explicit dark tokens and then repeats the dark block under `.theme-auto:not([data-theme='light'])`. The initial audit found three repeated inverse tokens that differed; the implementation pass aligned the auto dark block with the explicit dark values.

| Token                           | Explicit dark                         | Original auto dark                     | Implementation                       |
| ------------------------------- | ------------------------------------- | -------------------------------------- | ------------------------------------ |
| `--dry-color-text-inverse`      | line 32: `hsla(230, 100%, 15%, 0.9)`  | line 281: `hsla(230, 100%, 7%, 0.9)`   | Auto dark now matches explicit dark. |
| `--dry-color-text-inverse-weak` | line 33: `hsla(230, 100%, 20%, 0.65)` | line 282: `hsla(230, 100%, 10%, 0.65)` | Auto dark now matches explicit dark. |
| `--dry-color-stroke-inverse`    | line 46: `hsla(230, 100%, 20%, 0.45)` | line 295: `hsla(230, 100%, 15%, 0.45)` | Auto dark now matches explicit dark. |

### 3. Stale docs and generated surfaces, fixed

The repo-declared canonical theming rule `packages/ui/skills/dryui/rules/theming.md` originally documented pre-current tokens:

- `--dry-color-primary`
- `--dry-color-primary-hover`
- `--dry-color-surface`
- `--dry-color-surface-raised`
- `--dry-color-bg`
- `--dry-color-text`
- `--dry-color-text-secondary`
- `--dry-color-border`
- `--dry-color-border-hover`
- `--dry-font-size-sm`

Current runtime vocabulary uses the newer names:

- `--dry-color-fill-brand`
- `--dry-color-fill-brand-hover`
- `--dry-color-fill-brand-active`
- `--dry-color-bg-base`
- `--dry-color-bg-raised`
- `--dry-color-bg-overlay`
- `--dry-color-text-strong`
- `--dry-color-text-weak`
- `--dry-color-stroke-weak`
- `--dry-type-*`

Generated copy status:

- `packages/plugin/skills/dryui/rules/theming.md` is synced from the updated canonical rule.
- `packages/ui/skills/dryui/SKILL.md` and `packages/plugin/skills/dryui/SKILL.md` differ.
- `packages/ui/skills/dryui/.DS_Store` exists and is not canonical source.
- `packages/mcp/src/composition-data.ts` examples now use `--dry-color-fill-brand`; generated spec, contract, agent contract, LLM files, and docs component pages were regenerated.

Completed cleanup:

1. Update `packages/ui/skills/dryui/rules/theming.md`.
2. Replace `--dry-color-primary` snippets in `packages/mcp/src/composition-data.ts`.
3. Run `bun run sync:skills`.
4. Regenerate MCP/docs generated files through the existing repo scripts.

### 4. Fallback-only undefined hooks

There are 201 names in the stricter active-source scan, and 242 names in the broader usage scan, that are only consumed as `var(--name, fallback)`. This is not automatically wrong; it is the right shape for public override hooks. The risk is that undocumented fallback-only names look unused or missing to maintainers.

High-signal examples:

| Family         | Examples                                                                                                           | Recommendation                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Alert          | `--dry-alert-color`, `--dry-alert-gap`, `--dry-alert-padding`, `--dry-alert-radius`                                | Either document in component `cssVars` or keep private through component-local defaults. |
| App shell/docs | `--dry-app-bar-bg`, `--dry-app-bar-border`, `--dry-app-bar-shadow`                                                 | Prefix docs-only tokens as `--docs-*` or document as app shell contract.                 |
| AppFrame       | `--dry-app-frame-radius`, `--dry-app-frame-overflow`, `--dry-app-frame-dot-size`, `--dry-app-frame-chrome-padding` | Ensure component metadata exposes them if public.                                        |
| AreaGrid       | `--dry-area-grid-template-*`, `--dry-area-grid-auto-*`, `--dry-area-grid-justify-items`                            | These look public and should be in metadata/checker output.                              |
| Avatar         | `--dry-avatar-bg`, `--dry-avatar-color`, `--dry-avatar-status-color`, `--dry-avatar-status-size`                   | Public override hooks; document or generate from metadata.                               |
| Badge          | `--dry-badge-bg`, `--dry-badge-border`, `--dry-badge-color`, `--dry-badge-*`                                       | Public override hooks; document or generate from metadata.                               |
| Button         | `--dry-btn-soft-*`, `--dry-btn-trigger-open-*`, `--dry-btn-ghost-underline`                                        | Keep as component tokens only if intentionally public; otherwise prefer semantic tokens. |
| Forms/controls | `--dry-control-*`, `--dry-input-*`, `--dry-combobox-*`                                                             | Confirm shared form-control tokens cover the public surface.                             |
| Private UI     | `--_preset-font`, `--_swatch`                                                                                      | Acceptable only with fallbacks or guaranteed injection.                                  |

Suspicious fallback-only aliases to normalize:

- `--dry-color-icon-weak` in breadcrumb/list UI; current canonical text/icon weakness tokens are `--dry-color-text-weak` and `--dry-color-icon`.
- `--dry-color-text-weaker` in option picker metadata; consider `--dry-color-text-weak`.
- `--dry-font-size-base`, `--dry-font-size-sm`, and `--dry-font-size-xs` in feedback-server UI; current type scale is `--dry-type-*` / `--dry-text-*`.
- `--dry-text-lg-line-height` in `apps/docs/src/lib/demos/BorderBeamDemo.svelte`; likely `--dry-text-lg-leading`.

### 5. Unused candidates

The primary scan found 191 names that are defined but not consumed through `var(...)`; the usage explorer's narrower source parser reported 172. Many are false positives because they are public knobs set by Svelte custom-property attributes, used by JS, read by generated metadata, consumed by external users, or assigned for CSS cascade inheritance. Treat this as a review queue, not an automatic deletion list.

High-signal review targets:

- Private button vars in `packages/ui/src/button/button.svelte`: `--_dry-btn-soft-bg`, `--_dry-btn-soft-hover-bg`, `--_dry-btn-soft-active-bg`, `--_dry-btn-ghost-underline`.
- Calendar and range-calendar day/state tokens in `packages/ui/src/calendar/calendar-root.svelte` and `packages/ui/src/range-calendar/range-calendar-root.svelte`.
- Size/orientation tokens defined but not consumed in `chip-group-root.svelte`, `toggle-group-root.svelte`, `tabs-root.svelte`, and `segmented-control-root.svelte`.
- Color picker root tokens such as `--dry-color-picker-width`, `--dry-color-picker-indicator-size`, `--dry-color-picker-indicator-shadow`, and `--dry-color-picker-surface-hover`.
- Theme aliases that may exist for public consumption but are not used internally: `--dry-color-bg-alternate`, `--dry-color-bg-brand`, `--dry-color-fill-disabled`, `--dry-color-fill-overlay`, `--dry-color-fill-selected`, `--dry-color-fill-white`, `--dry-color-fill-yellow`.
- Shadow hover tokens not used broadly outside components: `--dry-shadow-md-hover`, `--dry-shadow-sm-hover`.
- Documentation-only or generated examples that set `--dry-btn-*`, `--dry-card-*`, and `--dry-input-*` directly despite current guidance preferring Tier-2 semantic overrides.
- Internal private tokens with selector-only consumption should be checked manually before removal because CSS may use them via inheritance or JS `setProperty`.

## Duplicate Policy

Not every duplicate is a bug.

Expected duplicates:

- Theme variants: `aurora`, `aurora-dark`, `midnight`, `terminal`, explicit dark, and auto dark.
- Selector state overrides, for example selected, hover, size, density, orientation, and reduced-motion branches.
- Component token defaults inside a root selector with state-specific overrides later in the same file.
- `@property` and generated dynamic variables in `packages/primitives/src/border-beam/styles.ts`.

Guardrails after implementation:

- Same mode, same selector intent, different values without a state or media-query reason.
- Explicit dark versus auto dark divergence should stay at zero for the inverse token set fixed here.
- Docs examples should not reintroduce old token names.
- Unprefixed local variables in broad scopes.

## Naming Audit

Preferred public DryUI token families:

- Primitive: `--dry-space-*`, `--dry-radius-*`, `--dry-shadow-*`, `--dry-type-*`, `--dry-text-*`, `--dry-font-*`, `--dry-duration-*`, `--dry-ease-*`, `--dry-layer-*`.
- Semantic/shared: `--dry-color-*`, `--dry-state-*`, `--dry-focus-*`, `--dry-form-control-*`, `--dry-overlay-*`, `--dry-control-*`, `--dry-image-*`, `--dry-scrollbar-*`.
- Component: `--dry-<component>-*` only when the component intentionally exposes the variable.
- Private/internal: `--_*` only when scoped and backed by fallbacks or guaranteed JS/Svelte injection.
- Runtime-generated: `--dryui-*`, for generated anchor names and similar implementation details.

Generic local variables found in docs/static/feedback surfaces include `--bg`, `--text`, `--accent`, `--panel`, `--muted`, `--sidebar-width`, `--tile-*`, `--agent-fg`, and `--toolbar-*`. Prefer `--docs-*`, `--feedback-*`, or component-specific prefixes outside tiny local scopes.

## Complete Theme Registry Check

Generated registry status:

| Registry                            | Count | Status                                           |
| ----------------------------------- | ----: | ------------------------------------------------ |
| `theme-tokens.generated.json.light` |   330 | Matches unique tokens parsed from `default.css`. |
| `theme-tokens.generated.json.dark`  |   144 | Matches unique tokens parsed from `dark.css`.    |

Differences between root light and dark registries are intentional: `dark.css` only overrides color, surface, shadow, glass, glow, gradient, scrollbar, and dark-mode-specific values. It does not repeat default spacing, radius, typography, duration, easing, layers, or shared form-control tokens.

## Implementation Status

1. Completed: fixed the high-confidence no-fallback token issues, including old feedback-server aliases and public docs demo tokens.
2. Completed: normalized the 3 divergent duplicate tokens in `dark.css`.
3. Completed: updated canonical theming docs to current token names.
4. Completed: replaced stale `--dry-color-primary` examples in MCP composition data and generated docs.
5. Completed: ran `bun run sync:skills`.
6. Completed: regenerated and checked MCP/docs generated surfaces.
7. Remaining review queue: fallback-only hooks and unused-looking definitions still need product/API decisions before they can be documented or removed.

## Verification Commands

Commands used during this audit:

```bash
rtk rg -n --hidden --glob '!node_modules/**' --glob '!dist/**' --glob '!build/**' --glob '!coverage/**' -- '--[A-Za-z0-9_-]+' .
rtk rg --files -g '*.css' -g '*.svelte' -g '*.ts' -g '*.md' -g '!node_modules/**' -g '!dist/**' -g '!build/**' -g '!coverage/**'
rtk node <<'NODE'
// Custom-property definition/usage scan across active source and docs.
NODE
rtk diff -qr packages/ui/skills/dryui packages/plugin/skills/dryui
rtk rg -n -- "--dry-color-primary|--dry-color-surface|--dry-color-bg\\b|--dry-color-text-secondary|--dry-color-border\\b|--dry-font-size-sm" packages/ui/skills packages/plugin/skills packages/mcp/src apps/docs/src apps/docs/static llms.txt
rtk rg -n -- "--_preset-color|--_preset-font|--_swatch|--workbench-bg|--dry-color-fill-danger|--dry-color-text-danger|--dry-color-shadow|--dry-color-stroke-error-weak|--dry-color-text\\)|--dry-text-sm-line" packages apps
```

Suggested verification after cleanup:

```bash
rtk bun run sync:skills
rtk bun run --filter '@dryui/mcp' generate-theme-tokens
rtk bun run --filter '@dryui/ui' build
rtk bun run docs:check
rtk bun run check:feedback-server
rtk bun run check:mcp
rtk bun run check:docs:llms
rtk bun run check:contract
rtk bun run check:agent-contract
rtk bun run check:architecture
rtk git diff --check
```
