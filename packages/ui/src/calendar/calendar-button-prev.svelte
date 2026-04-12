<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import CalendarNavButton from './calendar-nav-button.svelte';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let props: Props = $props();
</script>

<CalendarNavButton direction="prev" {...props} />
