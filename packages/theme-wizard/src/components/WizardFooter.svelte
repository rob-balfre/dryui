<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Button } from '@dryui/ui/button';

	interface Props extends HTMLAttributes<HTMLElement> {
		onback?: () => void;
		onnext?: () => void;
		backLabel?: string;
		nextLabel?: string;
	}

	let { onback, onnext, backLabel = 'Back', nextLabel = 'Next', ...rest }: Props = $props();
</script>

<footer data-wizard-footer {...rest}>
	{#if onback}
		<Button variant="ghost" onclick={onback}>&larr; {backLabel}</Button>
	{/if}
	{#if onnext}
		<Button variant="solid" onclick={onnext}>{nextLabel} &rarr;</Button>
	{/if}
</footer>

<style>
	[data-wizard-footer] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding-block: var(--dry-space-4);
		padding-inline: var(--dry-space-6);
		border-block-start: 1px solid var(--dry-app-bar-border, var(--dry-color-stroke-weak));
		transition: border-color var(--dry-duration-normal, 0.3s) var(--dry-ease-out, ease);
	}
</style>
