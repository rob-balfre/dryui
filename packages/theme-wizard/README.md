# @dryui/theme-wizard

Two layout models live in this package — pick the one that matches the host.

## 1. Workbench (single-page live editor)

Used by `apps/docs/src/routes/theme-wizard/+page.svelte`. The full surface is one editor: a compact top bar, a preview frame that fills the viewport, and a persistent bottom rail with `Accent / Base / Font / Radius / Density / Theme` controls. Recipes, contrast checks, and adjustment filters live in popovers. Source the state and helpers (`wizardState`, `getAllTokens`, `applyRecipe`, `RECIPE_PRESETS`, ...) from this package; assemble the layout in the host route.

This package does not export a `Workbench` component. The docs route owns the canonical workbench composition; copy from there if you need an in-product editor.

## 2. Onboarding shell (`WizardShell`)

Used by the CLI/init flow and any host that walks the user through the steps once. Composes `Personality → BrandColor → Typography → Shape → PreviewExport` with a step indicator and back/next buttons. Re-export from `@dryui/theme-wizard`:

```svelte
<script lang="ts">
	import { WizardShell, BrandColor, Typography, Shape } from '@dryui/theme-wizard';
</script>
```

`WizardShell` is intentionally separate from the workbench. Step-by-step navigation suits first-time setup; an editor surface suits exploration. Do not merge them.

## Engine and state

`wizardState`, `getAllTokens`, `getDerivedTheme`, `applyRecipe`, `decodeRecipe`, `RECIPE_PRESETS`, `PRESETS`, and the `setBrandHsb / setPersonality / setFontPreset / setTypeScale / setRadiusPreset / setDensity` setters are shared between both layout models. Whichever surface you build, drive it from this single source.
