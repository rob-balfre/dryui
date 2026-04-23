<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setDrawerCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		side?: 'top' | 'right' | 'bottom' | 'left';
		children: Snippet;
	}

	let { open = $bindable(false), side = 'right', children }: Props = $props();

	const uid = $props.id();
	const headerId = `drawer-${uid}`;

	const ctx = setDrawerCtx({
		get open() {
			return open;
		},
		get side() {
			return side;
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
