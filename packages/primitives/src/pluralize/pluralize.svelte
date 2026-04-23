<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		count: number;
		singular: string;
		plural: string;
	}

	let { count, singular, plural, ...rest }: Props = $props();

	const form = $derived(count === 1 ? singular : plural);
</script>

<span data-pluralize {...rest}>{count} {form}</span>

<style>
	[data-pluralize] {
		font-variant-numeric: var(--dry-numeric-variant);
		white-space: nowrap;
	}
</style>
