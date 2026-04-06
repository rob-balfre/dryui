<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '@dryui/primitives';
	import { setContextMenuCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children }: Props = $props();

	const triggerId = generateFormId('context-menu-trigger');
	const contentId = generateFormId('context-menu-content');

	let position = $state({ x: 0, y: 0 });

	setContextMenuCtx({
		get open() {
			return open;
		},
		triggerId,
		contentId,
		triggerEl: null,
		get position() {
			return position;
		},
		set position(value: { x: number; y: number }) {
			position = value;
		},
		show() {
			open = true;
		},
		close() {
			open = false;
		},
		toggle() {
			open = !open;
		}
	});
</script>

{@render children()}
