<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setFlowDiagramCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		direction?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let { direction = 'horizontal', class: className, children, ...rest }: Props = $props();

	setFlowDiagramCtx({
		get direction() {
			return direction;
		}
	});
</script>

<div
	role="img"
	data-flow-diagram
	data-direction={direction}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-flow-diagram] {
		--dry-flow-gap: var(--dry-space-2);
		--dry-flow-node-bg: var(--dry-color-bg-raised);
		--dry-flow-node-border: var(--dry-color-stroke-weak);
		--dry-flow-node-color: var(--dry-color-text-strong);
		--dry-flow-node-radius: var(--dry-radius-lg);
		--dry-flow-arrow-color: var(--dry-color-stroke-strong);
		--dry-flow-connector-size: var(--dry-space-6);

		display: grid;
		align-items: center;
		gap: var(--dry-flow-gap);
	}

	[data-flow-diagram][data-direction='horizontal'] {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
	}

	[data-flow-diagram][data-direction='vertical'] {
		grid-auto-flow: row;
		grid-auto-rows: max-content;
		justify-items: center;
	}
</style>
