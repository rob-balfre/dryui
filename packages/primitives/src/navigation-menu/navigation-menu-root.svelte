<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setNavigationMenuCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	let activeItem = $state<string | null>(null);
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	setNavigationMenuCtx({
		get activeItem() {
			return activeItem;
		},
		openItem(id) {
			clearTimeout(closeTimer);
			activeItem = id;
		},
		closeItem() {
			closeTimer = setTimeout(() => {
				activeItem = null;
			}, 200);
		}
	});

	$effect(() => {
		return () => {
			clearTimeout(closeTimer);
		};
	});
</script>

<nav class={className} data-state={activeItem ? 'open' : 'closed'} {...rest}>
	{@render children()}
</nav>
