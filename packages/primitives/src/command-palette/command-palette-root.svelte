<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { generateFormId } from '../utils/form-control.svelte.js';
	import { setCommandPaletteCtx } from './context.svelte.js';
	import ModalContent from '../internal/modal-content.svelte';

	interface Props extends HTMLAttributes<HTMLDialogElement> {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children, ...rest }: Props = $props();

	const listId = generateFormId('cmd-list');
	const inputId = generateFormId('cmd-input');

	let query = $state('');
	let activeItemId = $state('');
	let itemCount = $state(0);
	const items = new Map<string, HTMLElement>();

	const ctx = setCommandPaletteCtx({
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

	const modalCtx = {
		get open() {
			return open;
		},
		headerId: '',
		close() {
			open = false;
		}
	};

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

<ModalContent ctx={modalCtx} aria-labelledby={undefined} onclick={() => {}} {...rest}>
	{@render children()}
</ModalContent>
