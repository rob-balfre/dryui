<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setPopoverCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children }: Props = $props();

	const uid = $props.id();
	const triggerId = `popover-trigger-${uid}`;
	const contentId = `popover-content-${uid}`;

	setPopoverCtx({
		get open() {
			return open;
		},
		get triggerId() {
			return triggerId;
		},
		get contentId() {
			return contentId;
		},
		triggerEl: null,
		toggle() {
			open = !open;
		},
		show() {
			open = true;
		},
		close() {
			open = false;
		}
	});
</script>

{@render children()}
