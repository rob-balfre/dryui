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
	let openTimer: ReturnType<typeof setTimeout> | undefined;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	function clearPendingTimers() {
		clearTimeout(openTimer);
		clearTimeout(closeTimer);
	}

	function closeImmediately(options?: { restoreFocus?: boolean }) {
		const triggerId = options?.restoreFocus ? activeTriggerId : null;
		clearPendingTimers();
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
			clearPendingTimers();
			openTimer = setTimeout(() => {
				activeItem = id;
				activeTriggerId = triggerId;
			}, 150);
		},
		closeItem() {
			clearPendingTimers();
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
			clearPendingTimers();
		};
	});
</script>

<nav
	data-mega-menu-root
	data-state={activeItem ? 'open' : 'closed'}
	class={className}
	onkeydown={handleKeydown}
	onfocusout={handleFocusOut}
	{...rest}
>
	{@render children()}
</nav>

<style>
	[data-mega-menu-root] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1, 0.25rem);
		position: relative;
	}
</style>
