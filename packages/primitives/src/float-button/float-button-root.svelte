<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setFloatButtonCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children, ...rest }: Props = $props();

	setFloatButtonCtx({
		get open() {
			return open;
		},
		toggle() {
			open = !open;
		}
	});
</script>

<div data-state={open ? 'open' : 'closed'} {...rest}>
	{@render children()}
</div>
