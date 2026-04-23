<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setAlertDialogCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children }: Props = $props();

	const uid = $props.id();
	const headerId = `alert-dialog-${uid}`;

	setAlertDialogCtx({
		get open() {
			return open;
		},
		get headerId() {
			return headerId;
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
