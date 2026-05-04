<script lang="ts">
	import { ThemeToggle as BaseThemeToggle } from '@dryui/ui/theme-toggle';
	import { docsTheme } from '$lib/theme.svelte.js';
</script>

<BaseThemeToggle controller={docsTheme} size="md" />
