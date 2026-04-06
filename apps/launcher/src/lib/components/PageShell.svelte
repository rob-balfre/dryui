<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		align?: 'center' | 'start';
		children: Snippet;
	}

	let { align = 'start', children }: Props = $props();
</script>

<div class="page-shell" data-align={align}>
	{@render children()}
</div>

<style>
	.page-shell {
		display: grid;
		place-items: center start;
		min-height: 100dvh;
		padding: var(--dry-space-8) var(--dry-space-4);
	}

	.page-shell[data-align='center'] {
		place-items: center;
	}
</style>
