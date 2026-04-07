<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const ctx = getAffixGroupCtx();
</script>

<span
	data-part="prefix"
	data-size={ctx.size}
	data-disabled={ctx.disabled || undefined}
	data-invalid={ctx.invalid || undefined}
	data-orientation={ctx.orientation}
	{...rest}
	data-input-group-prefix
	class={className}
>
	{@render children()}
</span>

<style>
	[data-input-group-prefix] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: 0.5rem;
		padding: 0 var(--dry-input-group-padding-x);
		color: var(--dry-input-group-muted);
		white-space: nowrap;
	}

	[data-input-group-prefix][data-orientation='horizontal'] {
		grid-column: 1;
	}
</style>
