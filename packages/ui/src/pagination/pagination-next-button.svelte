<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import PaginationNavButton from './pagination-nav-button.svelte';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let props: Props = $props();
</script>

<PaginationNavButton direction="next" {...props} />
