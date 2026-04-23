<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<div class={className} data-card-footer {...rest}>
	{@render children()}
</div>

<style>
	[data-card-footer] {
		padding: var(--dry-card-padding, var(--dry-padding-card));
		border-top: 1px solid var(--dry-card-border, var(--dry-color-stroke-weak));
	}

	@container (max-width: 300px) {
		[data-card-footer] {
			padding: var(--dry-space-4);
		}
	}
</style>
