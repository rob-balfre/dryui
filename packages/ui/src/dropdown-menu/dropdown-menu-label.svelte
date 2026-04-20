<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import MenuLabel from '../internal/menu-label.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<MenuLabel data-dropdown-menu-label {className} {...rest}>
	{@render children()}
</MenuLabel>
