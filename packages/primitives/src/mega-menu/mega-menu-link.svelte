<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		icon?: Snippet;
		description?: Snippet;
		children: Snippet;
	}

	let { icon, description, class: className, children, ...rest }: Props = $props();
</script>

<a class={className} {...rest}>
	{#if icon}
		<span data-part="link-icon">
			{@render icon()}
		</span>
	{/if}
	<span data-part="link-content">
		<span data-part="link-text">
			{@render children()}
		</span>
		{#if description}
			<span data-part="link-description">
				{@render description()}
			</span>
		{/if}
	</span>
</a>
