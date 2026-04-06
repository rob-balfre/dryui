<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getToolbarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();

	const ctx = getToolbarCtx();
</script>

<div
	role="separator"
	aria-orientation={ctx.orientation === 'horizontal' ? 'vertical' : 'horizontal'}
	{...rest}
></div>
