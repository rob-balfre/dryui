---
'@dryui/ui': minor
'@dryui/primitives': minor
'@dryui/lint': minor
'@dryui/mcp': minor
'@dryui/theme-wizard': patch
'@dryui/feedback-server': patch
---

Bake Jakub Krehel's 11 interface-polish principles into DryUI: new concentric-radius / motion / numeric / optical tokens; `--dry-shadow-{sm,md,lg,xl}` redefined with a 3-layer edge + contact + ambient recipe (plus `-hover` variants and dark/midnight/aurora/terminal overrides); Card drops its default 1px border in favour of shadow-only chrome (with `bordered` escape hatch); Separator gains `variant="shadow"`; Image + Avatar switch inset box-shadow to outline; Button gains optical `:has()` padding trim + `data-dry-icon` marker on Icon; Field.Root gains `nestRadius`; Badge gains `numeric`; RelativeTime + FormatDate pick up tabular-nums via `--dry-numeric-variant`; overlay radii (Dialog, Popover, DropdownMenu, ContextMenu, Menubar, Toast, Tooltip, Drawer, CommandPalette) consume per-container tokens.

New primitives: `<IconSwap>`, `<Numeric>`, `<Enter>`, `<Exit>`, `<Stagger>` components plus `enter` / `leave` Svelte transition functions exported from `@dryui/ui/motion`.

Check surface: `@dryui/lint` gains a `category: 'polish' | 'correctness' | 'a11y'` field on `RuleCatalogEntry`, 12 new `polish/*` rules (raw-heading, raw-paragraph, raw-img, raw-icon-conditional, nested-radius-mismatch, missing-theme-smoothing, numeric-without-tabular, inter-tabular-warning, keyframes-on-interactive, ad-hoc-enter-keyframe, symmetric-exit-animation, solid-border-on-raised), a `checkTheme()` export for theme-file polish rules, and `checkSvelteFile` / `checkStyle` / `checkMarkup` / `checkScript` all accept a `categoryFilter`. The `@dryui/lint` preprocessor now filters by severity so only `error`-severity violations block the build; suggestion/warning/info print but don't fail CI. `@dryui/mcp` `check` accepts `scope: 'polish' | 'no-polish'`, and `renderTheme` omits the coverage field from its header when the theme-correctness audit is scope-skipped.

Docs: new `/docs/polish-pass` page and ten composition recipes (typography, concentric-radius, icon-swap, numeric-display, interactive-motion, stagger-entrance, exit-animation, shadow-as-border, icon-in-button, image-edge).
