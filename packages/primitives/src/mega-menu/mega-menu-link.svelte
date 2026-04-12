<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAnchorAttributes, 'children' | 'type'> {
		href?: string;
		rel?: string;
		target?: string;
		download?: boolean | string;
		type?: 'button' | 'submit' | 'reset';
		icon?: Snippet;
		description?: Snippet;
		children: Snippet;
	}

	let {
		href,
		rel,
		target,
		download,
		type = 'button',
		icon,
		description,
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

{#snippet body()}
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
{/snippet}

{#if href !== undefined}
	<a {href} {rel} {target} {download} class={className} {...rest}>
		{@render body()}
	</a>
{:else}
	<button {type} class={className} {...rest as HTMLButtonAttributes}>
		{@render body()}
	</button>
{/if}
