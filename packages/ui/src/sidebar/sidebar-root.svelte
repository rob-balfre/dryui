<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setSidebarCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		collapsed?: boolean;
		side?: 'left' | 'right';
		children: Snippet;
	}

	let {
		collapsed = $bindable(false),
		side = 'left',
		class: className,
		children,
		...rest
	}: Props = $props();

	setSidebarCtx({
		get collapsed() {
			return collapsed;
		},
		get side() {
			return side;
		},
		toggle() {
			collapsed = !collapsed;
		},
		expand() {
			collapsed = false;
		},
		collapse() {
			collapsed = true;
		}
	});
</script>

<aside
	data-sidebar
	data-state={collapsed ? 'collapsed' : 'expanded'}
	data-side={side}
	class={className}
	{...rest}
>
	{@render children()}
</aside>

<style>
	[data-sidebar] {
		--dry-sidebar-item-padding-x: var(--dry-space-6);
		--dry-sidebar-content-padding: 0;

		display: grid;
		grid-template-columns: var(--dry-sidebar-width, 320px);
		grid-template-rows: auto 1fr auto;
		height: 100%;
		overflow: var(--dry-sidebar-overflow, hidden);
		background: var(--dry-sidebar-bg, var(--dry-chrome-bg, var(--dry-color-bg-raised)));
		font-family: var(--dry-font-sans);
	}

	[data-sidebar][data-side='left'] {
		border-inline-end: 1px solid
			var(--dry-sidebar-border, var(--dry-chrome-border, var(--dry-color-stroke-weak)));
	}

	[data-sidebar][data-side='right'] {
		border-inline-start: 1px solid
			var(--dry-sidebar-border, var(--dry-chrome-border, var(--dry-color-stroke-weak)));
	}

	[data-sidebar][data-state='collapsed'] {
		grid-template-columns: var(--dry-sidebar-collapsed-width, 4.5rem);
	}
</style>
