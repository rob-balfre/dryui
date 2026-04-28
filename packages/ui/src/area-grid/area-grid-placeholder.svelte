<script lang="ts">
	import AreaGridShell from './area-grid-shell.svelte';

	export type AreaGridPlaceholderProps = {
		area: string;
	};

	let { area }: AreaGridPlaceholderProps = $props();
</script>

<AreaGridShell --dry-grid-area-name={area}>
	<div data-area-grid-placeholder>
		<span>{area}</span>
	</div>
</AreaGridShell>

<style>
	[data-area-grid-placeholder] {
		min-block-size: 2rem;
		padding: var(--dry-space-4, 1rem);
		display: grid;
		place-items: center;
		font-family: var(--dry-font-sans, ui-sans-serif, system-ui, sans-serif);
		font-size: var(--dry-font-size-sm, 0.875rem);
		font-weight: 500;
		text-transform: lowercase;
		letter-spacing: 0.02em;
		color: var(--dry-color-text-weak, currentColor);
	}
</style>
