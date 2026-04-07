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

<style>
	[data-notification-center-item] {
		padding: var(--dry-nc-item-padding, 0.75rem);
		border-bottom: 1px solid var(--dry-color-stroke-weak, #e2e8f0);
		transition: background var(--dry-duration-fast, 100ms) ease;
	}

	[data-notification-center-item]:last-child {
		border-bottom: none;
	}

	[data-notification-center-item][data-state='unread'] {
		background: var(--dry-nc-unread-bg, #eff6ff);
	}

	[data-notification-center-item][data-variant='warning'] {
		border-left: 3px solid var(--dry-color-fill-warning);
	}

	[data-notification-center-item][data-variant='critical'] {
		border-left: 3px solid var(--dry-color-fill-error);
	}

	[data-notification-center-item][data-variant='info'] {
		border-left: 3px solid var(--dry-color-fill-brand);
	}
</style>
