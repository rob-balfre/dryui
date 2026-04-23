<script lang="ts">
	import type { Snippet } from 'svelte';
	import { leave } from './leave.js';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<div out:leave>
	{@render children?.()}
</div>

<style>
	div {
		display: contents;
	}
</style>
