<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setButtonGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'horizontal' | 'vertical';
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		orientation = 'horizontal',
		size = 'md',
		class: className,
		children,
		...rest
	}: Props = $props();

	setButtonGroupCtx({
		get orientation() {
			return orientation;
		}
	});
</script>

<div
	role="group"
	data-button-group
	data-orientation={orientation}
	data-size={size}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-button-group] {
		--dry-button-group-radius: var(--dry-radius-md);
		--dry-button-group-hover-z-index: 1;

		display: inline-grid;
		gap: var(--dry-button-group-gap, 0px);
	}

	[data-button-group][data-orientation='horizontal'] {
		grid-auto-flow: column;
	}

	[data-button-group][data-size='sm'] {
		--dry-button-group-radius: var(--dry-radius-sm);
	}

	[data-button-group][data-size='md'] {
		--dry-button-group-radius: var(--dry-radius-md);
	}

	[data-button-group][data-size='lg'] {
		--dry-button-group-radius: var(--dry-radius-lg);
	}
</style>
