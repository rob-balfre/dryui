<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContextMenuCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children }: Props = $props();

	const uid = $props.id();
	const triggerId = `context-menu-trigger-${uid}`;
	const contentId = `context-menu-content-${uid}`;

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
