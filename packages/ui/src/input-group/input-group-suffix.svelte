<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const ctx = getAffixGroupCtx();
</script>

<div
	data-part="suffix"
	data-size={ctx.size}
	data-disabled={ctx.disabled || undefined}
	data-invalid={ctx.invalid || undefined}
	{...rest}
	data-input-group-suffix
	class={className}
>
	{@render children()}
</div>

<style>
	[data-input-group-suffix] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: 0.5rem;
		padding: 0 var(--dry-input-group-padding-x);
		color: var(--dry-input-group-muted);
		white-space: nowrap;
	}
</style>
