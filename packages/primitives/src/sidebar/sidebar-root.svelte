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
	data-state={collapsed ? 'collapsed' : 'expanded'}
	data-side={side}
	class={className}
	{...rest}
>
	{@render children()}
</aside>
