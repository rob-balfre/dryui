<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import MenuGroup from '../internal/menu-group.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<MenuGroup {className} {...rest}>
	{@render children()}
</MenuGroup>
