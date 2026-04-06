<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLElement>, 'role'> {
		as?: 'div' | 'button' | 'a';
		role?: HTMLAttributes<HTMLElement>['role'];
		selected?: boolean;
		children: Snippet;
	}

	let {
		as = 'div',
		role = 'region',
		selected,
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<svelte:element
	this={as}
	{role}
	data-selected={selected ? '' : undefined}
	class={className}
	{...rest}
>
	{@render children()}
</svelte:element>
