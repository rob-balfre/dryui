<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { generateFormId } from '@dryui/primitives';
	import { setCommandPaletteCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDialogElement> {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), class: className, children, ...rest }: Props = $props();

	const listId = generateFormId('cmd-list');
	const inputId = generateFormId('cmd-input');

	let query = $state('');
	let activeItemId = $state('');
	let itemCount = $state(0);
	const items = new Map<string, HTMLElement>();

	setCommandPaletteCtx({
		get open() {
			return open;
		},
		get query() {
			return query;
		},
		set query(v: string) {
			query = v;
		},
		get activeItemId() {
			return activeItemId;
		},
		set activeItemId(v: string) {
			activeItemId = v;
		},
		show() {
			open = true;
		},
		close() {
			open = false;
		},
		get listId() {
			return listId;
		},
		get inputId() {
			return inputId;
		},
		get itemCount() {
			return itemCount;
		},
		set itemCount(v: number) {
			itemCount = v;
		},
		registerItem(id: string, el: HTMLElement) {
			items.set(id, el);
			itemCount = items.size;
		},
		unregisterItem(id: string) {
			items.delete(id);
			itemCount = items.size;
			if (activeItemId === id) {
				activeItemId = '';
			}
		},
		setActiveItem(id: string) {
			activeItemId = id;
		},
		getItems() {
			return items;
		}
	});

	let dialogEl = $state<HTMLDialogElement>();

	$effect(() => {
		if (open && dialogEl && !dialogEl.open) {
			dialogEl.showModal();
		}
		if (!open && dialogEl?.open) {
			dialogEl.close();
		}
	});

	$effect(() => {
		if (open) {
			query = '';
			activeItemId = '';
		}
	});

	$effect(() => {
		function handleKeydown(e: KeyboardEvent) {
			const target = e.target;
			if (target instanceof HTMLElement) {
				if (
					target.isContentEditable ||
					target.closest(
						'input, textarea, select, [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]'
					)
				) {
					return;
				}
			}

			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				open = !open;
			}
		}

		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});
</script>

<dialog
	bind:this={dialogEl}
	data-command-palette-root
	data-state={open ? 'open' : 'closed'}
	closedby="any"
	onclose={() => {
		open = false;
	}}
	onclick={(e) => {
		if (e.target === dialogEl) {
			open = false;
		}
	}}
	class={className}
	{...rest}
>
	{@render children()}
</dialog>

<style>
	/* outer: var(--dry-radius-dialog); children inside the padded region use var(--dry-radius-nested-dialog). */
	[data-command-palette-root] {
		--dry-cmd-bg: var(--dry-color-bg-overlay);
		--dry-cmd-border: var(--dry-color-stroke-weak);
		--dry-cmd-radius: var(--dry-radius-dialog);
		--dry-cmd-shadow: var(--dry-shadow-xl);
		--dry-cmd-max-width: 32rem;

		border: 1px solid var(--dry-cmd-border);
		border-radius: var(--dry-cmd-radius);
		background: var(--dry-cmd-bg);
		color: var(--dry-color-text-strong);
		box-shadow: var(--dry-cmd-shadow);
		margin: auto;
		padding: 0;
		overflow: hidden;
		max-height: 24rem;
		display: grid;
		grid-template-columns: minmax(0, min(var(--dry-cmd-max-width), 90vw));
		grid-template-rows: auto minmax(0, 1fr);

		transition:
			opacity var(--dry-duration-normal) var(--dry-ease-spring-soft),
			transform var(--dry-duration-normal) var(--dry-ease-spring-soft);
	}

	[data-command-palette-root]:not([open]) {
		display: none;
	}

	[data-command-palette-root]::backdrop {
		background: var(--dry-color-overlay-backdrop);
	}

	[data-command-palette-root][data-state='open'] {
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-command-palette-root][open] {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter)) translateY(var(--dry-motion-distance-xs));
		}
	}
</style>
