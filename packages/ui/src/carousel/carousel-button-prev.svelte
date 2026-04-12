<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import CarouselNavButton from './carousel-nav-button.svelte';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let props: Props = $props();
</script>

<CarouselNavButton direction="prev" {...props} />
