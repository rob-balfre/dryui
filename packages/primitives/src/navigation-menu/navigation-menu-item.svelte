<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '../utils/form-control.svelte.js';
	import { getNavigationMenuCtx, setNavigationMenuItemCtx } from './context.svelte.js';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const ctx = getNavigationMenuCtx();
	const itemId = generateFormId('nav-item');
	const triggerId = generateFormId('nav-trigger');
	const contentId = generateFormId('nav-content');

	setNavigationMenuItemCtx({
		itemId,
		triggerId,
		contentId,
		get open() {
			return ctx.activeItem === itemId;
		}
	});
</script>

<li>
	{@render children()}
</li>
