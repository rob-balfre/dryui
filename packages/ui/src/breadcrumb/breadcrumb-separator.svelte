<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
		children?: Snippet | undefined;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<li role="presentation" aria-hidden="true" data-breadcrumb-separator class={className} {...rest}>
	{#if children}
		{@render children()}
	{:else}
		/
	{/if}
</li>

<style>
	[data-breadcrumb-separator] {
		color: var(--dry-breadcrumb-separator-color, var(--dry-color-icon-weak, var(--dry-color-icon)));
		user-select: none;
	}
</style>
