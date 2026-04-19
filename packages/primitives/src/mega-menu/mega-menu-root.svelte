<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setMegaMenuCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	let activeItem = $state<string | null>(null);
	let activeTriggerId = $state<string | null>(null);
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	function clearPendingClose() {
		clearTimeout(closeTimer);
	}

	function closeImmediately(options?: { restoreFocus?: boolean }) {
		const triggerId = options?.restoreFocus ? activeTriggerId : null;
		clearPendingClose();
		activeItem = null;
		activeTriggerId = null;

		if (!triggerId) return;

		const trigger = document.getElementById(triggerId);
		if (trigger instanceof HTMLElement) {
			trigger.focus();
		}
	}

	setMegaMenuCtx({
		get activeItem() {
			return activeItem;
		},
		openItem(id, triggerId) {
			clearPendingClose();
			activeItem = id;
			activeTriggerId = triggerId;
		},
		closeItem() {
			clearPendingClose();
			closeTimer = setTimeout(() => {
				activeItem = null;
				activeTriggerId = null;
			}, 300);
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && activeItem) {
			e.preventDefault();
			closeImmediately({ restoreFocus: true });
		}
	}

	function handleFocusOut(e: FocusEvent) {
		const nav = e.currentTarget as HTMLElement;
		const related = e.relatedTarget as Node | null;
		if (related && !nav.contains(related)) {
			closeImmediately();
		}
	}

	$effect(() => {
		return () => {
			clearPendingClose();
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
