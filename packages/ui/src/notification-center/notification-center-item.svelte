<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		id: string;
		read?: boolean;
		timestamp?: Date;
		variant?: 'info' | 'warning' | 'critical';
		action?: Snippet;
		children: Snippet;
	}

	let {
		id,
		read = false,
		timestamp,
		variant,
		action,
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<div
	data-part="item"
	data-notification-center-item
	data-state={read ? 'read' : 'unread'}
	data-variant={variant}
	data-id={id}
	class={className}
	{...rest}
>
	{@render children()}
	{#if action}
		<div data-part="item-action">
			{@render action()}
		</div>
	{/if}
</div>
