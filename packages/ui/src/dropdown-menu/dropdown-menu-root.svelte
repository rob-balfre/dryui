<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setDropdownMenuCtx } from './context.svelte.js';
	import { createMenuRootState } from '../internal/menu-root-state.svelte.js';

	interface Props {
		open?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), children }: Props = $props();
	const uid = $props.id();

	setDropdownMenuCtx(
		createMenuRootState({
			idBase: 'dropdown',
			uid,
			getOpen: () => open,
			setOpen: (value) => {
				open = value;
			}
		})
	);
</script>

{@render children()}
