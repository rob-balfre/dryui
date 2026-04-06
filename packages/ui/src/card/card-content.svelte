<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		noPadding?: boolean;
	}

	let { class: className, children, noPadding = false, ...rest }: Props = $props();
</script>

<div class={className} data-card-content data-no-padding={noPadding ? '' : undefined} {...rest}>
	{@render children()}
</div>

<style>
	[data-card-content] {
		padding: var(--dry-card-padding, var(--dry-space-8));
		overflow-x: auto;
	}

	[data-card-content][data-no-padding] {
		padding: 0;
	}

	@container (max-width: 300px) {
		[data-card-content]:not([data-no-padding]) {
			padding: var(--dry-space-4);
		}
	}
</style>
