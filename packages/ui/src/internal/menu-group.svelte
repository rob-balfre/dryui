<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		className?: HTMLAttributes<HTMLDivElement>['class'];
		children: Snippet;
	}

	let { className, children, ...rest }: Props = $props();
</script>

<div role="group" class={className} {...rest}>
	{@render children()}
</div>
