<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTimeElement> {
		datetime?: string;
		children: Snippet;
	}

	let { class: className, datetime, children, ...rest }: Props = $props();
</script>

<time data-part="time" class={className} {datetime} {...rest}>
	{@render children()}
</time>

<style>
	[data-part='time'] {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
	}
</style>
