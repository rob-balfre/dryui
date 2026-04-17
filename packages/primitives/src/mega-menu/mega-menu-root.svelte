<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setMegaMenuCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	let activeItem = $state<string | null>(null);
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	setMegaMenuCtx({
		get activeItem() {
			return activeItem;
		},
		openItem(id) {
			clearTimeout(closeTimer);
			activeItem = id;
		},
		closeItem() {
			clearTimeout(closeTimer);
			closeTimer = setTimeout(() => {
				activeItem = null;
			}, 300);
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && activeItem) {
			e.preventDefault();
			clearTimeout(closeTimer);
			activeItem = null;
		}
	}

	function handleFocusOut(e: FocusEvent) {
		const nav = e.currentTarget as HTMLElement;
		const related = e.relatedTarget as Node | null;
		if (related && !nav.contains(related)) {
			clearTimeout(closeTimer);
			activeItem = null;
		}
	}

	$effect(() => {
		return () => {
			clearTimeout(closeTimer);
		};
	});
</script>

<nav
	class={className}
	data-state={activeItem ? 'open' : 'closed'}
	onkeydown={handleKeydown}
	onfocusout={handleFocusOut}
	{...rest}
>
	{@render children()}
</nav>
