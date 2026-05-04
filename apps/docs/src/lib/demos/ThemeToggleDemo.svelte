<script lang="ts">
	import { ThemeToggle } from '@dryui/ui';
	import { docsTheme } from '$lib/theme.svelte.js';

	const mode = $derived(docsTheme.mode);
	const renderedTheme = $derived(docsTheme.isDark ? 'dark' : 'light');
</script>

<div class="toggle-demo">
	<div class="status">
		<p class="eyebrow">Stored preference</p>
		<p class="value">{mode}</p>
		<p class="rendered">Renders as {renderedTheme}</p>
	</div>
	<ThemeToggle controller={docsTheme} />
	<p class="note">
		This toggle shares a controller with the one in the page header, so flipping either swaps the
		whole page. Alt-click (or press Escape while focused) to reset to the system preference.
	</p>
</div>

<style>
	.toggle-demo {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.status {
		display: grid;
		gap: var(--dry-space-1);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.value {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-lg-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.rendered {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.note {
		grid-column: 1 / -1;
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
		max-inline-size: 62ch;
	}
</style>
