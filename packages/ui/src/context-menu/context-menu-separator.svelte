<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import MenuSeparator from '../internal/menu-separator.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();
</script>

<MenuSeparator data-context-menu-separator {className} {...rest}></MenuSeparator>
