# @dryui/theme-wizard

Experimental theme generation package. The public docs route for the theme wizard is currently parked, but the package remains in the workspace for the CLI/init flow and future work.

## Onboarding shell (`WizardShell`)

Used by the CLI/init flow and any host that walks the user through the steps once. Composes `Personality → BrandColor → Typography → Shape → PreviewExport` with a step indicator and back/next buttons. Re-export from `@dryui/theme-wizard`:

```svelte
<script lang="ts">
	import { WizardShell, BrandColor, Typography, Shape } from '@dryui/theme-wizard';
</script>
```

`WizardShell` is intentionally separate from the workbench. Step-by-step navigation suits first-time setup; an editor surface suits exploration. Do not merge them.

## Engine and state

`wizardState`, `getAllTokens`, `getDerivedTheme`, `applyRecipe`, `decodeRecipe`, `RECIPE_PRESETS`, `PRESETS`, and the `setBrandHsb / setPersonality / setFontPreset / setTypeScale / setRadiusPreset / setDensity` setters are the shared source for theme generation. Whichever surface you build, drive it from this package.
