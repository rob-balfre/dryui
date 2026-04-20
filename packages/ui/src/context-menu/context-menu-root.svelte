<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContextMenuCtx } from './context.svelte.js';
	import { createPositionedMenuRootState } from '../internal/menu-root-state.svelte.js';

	interface Props {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children }: Props = $props();

	setContextMenuCtx(
		createPositionedMenuRootState({
			idBase: 'context-menu',
			getOpen: () => open,
			setOpen: (value) => {
				open = value;
			}
		})
	);
</script>

{@render children()}
