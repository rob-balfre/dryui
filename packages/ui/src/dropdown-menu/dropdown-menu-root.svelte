<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '@dryui/primitives';
	import { setDropdownMenuCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children }: Props = $props();

	const triggerId = generateFormId('dropdown-trigger');
	const contentId = generateFormId('dropdown-content');

	setDropdownMenuCtx({
		get open() {
			return open;
		},
		triggerId,
		contentId,
		triggerEl: null,
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
