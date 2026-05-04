<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { leave } from './leave.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div out:leave data-dry-exit class={className} {...rest}>
	{@render children?.()}
</div>

<style>
	[data-dry-exit] {
		display: grid;
	}
</style>
