<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createId } from '../utils/create-id.js';
	import { setCollapsibleCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		open?: boolean;
		disabled?: boolean;
		children: Snippet;
	}

	let { open = $bindable(false), disabled = false, children, ...rest }: Props = $props();

	const contentId = createId('collapsible-content');

	setCollapsibleCtx({
		get open() {
			return open;
		},
		get disabled() {
			return disabled;
		},
		get contentId() {
			return contentId;
		},
		toggle() {
			if (!disabled) {
				open = !open;
			}
		}
	});
</script>

<div data-state={open ? 'open' : 'closed'} data-disabled={disabled || undefined} {...rest}>
	{@render children()}
</div>
