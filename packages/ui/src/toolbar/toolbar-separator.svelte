<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getToolbarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getToolbarCtx();
</script>

<div
	role="separator"
	aria-orientation={ctx.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
	data-part="separator"
	data-orientation={ctx.orientation}
	class={className}
	{...rest}
></div>

<style>
	[data-part='separator'] {
		height: var(--dry-space-6);
		border-inline-start: 1px solid var(--dry-color-stroke-weak);
		align-self: center;
	}

	[data-part='separator'][data-orientation='vertical'] {
		height: 0;
		border-inline-start: none;
		border-block-start: 1px solid var(--dry-color-stroke-weak);
	}
</style>
