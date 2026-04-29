<script lang="ts">
	import AreaGridShell from './area-grid-shell.svelte';

	export type AreaGridPlaceholderProps = {
		area?: string;
		label?: string;
	};

	let { area, label }: AreaGridPlaceholderProps = $props();
	const display = label ?? area ?? '';
</script>

{#if area}
	<AreaGridShell --dry-grid-area-name={area}>
		<div data-area-grid-placeholder>
			<span>{display}</span>
		</div>
	</AreaGridShell>
{:else}
	<AreaGridShell>
		<div data-area-grid-placeholder>
			<span>{display}</span>
		</div>
	</AreaGridShell>
{/if}

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
