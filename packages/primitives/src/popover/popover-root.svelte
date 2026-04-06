<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '../utils/form-control.svelte.js';
	import { setPopoverCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children }: Props = $props();

	const triggerId = generateFormId('popover-trigger');
	const contentId = generateFormId('popover-content');

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
