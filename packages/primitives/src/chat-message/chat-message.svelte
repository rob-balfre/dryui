<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		role?: 'user' | 'assistant' | 'system';
		avatar?: string;
		name?: string;
		timestamp?: string;
		typing?: boolean;
		children: Snippet;
	}

	let {
		role = 'user',
		avatar,
		name,
		timestamp,
		typing = false,
		children,
		...rest
	}: Props = $props();
</script>

<div data-role={role} data-typing={typing ? 'true' : undefined} {...rest}>
	{#if avatar || name}
		<div data-part="header">
			{#if avatar}
				<img src={avatar} alt={name ?? role} data-part="avatar" />
			{/if}
			{#if name}
				<span data-part="name">{name}</span>
			{/if}
			{#if timestamp}
				<time data-part="timestamp">{timestamp}</time>
			{/if}
		</div>
	{/if}
	<div data-part="content">
		{@render children()}
	</div>
</div>
