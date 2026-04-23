<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setDropdownMenuCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children }: Props = $props();

	const uid = $props.id();
	const triggerId = `dropdown-trigger-${uid}`;
	const contentId = `dropdown-content-${uid}`;

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
