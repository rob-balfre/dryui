<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		className?: HTMLAttributes<HTMLDivElement>['class'];
	}

	let { className, ...rest }: Props = $props();
</script>

<div role="separator" class={className} {...rest}></div>

<style>
	div {
		height: 1px;
		background: var(--dry-color-stroke-weak);
		margin: var(--dry-space-1) 0;
	}
</style>
