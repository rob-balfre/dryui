<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getNotificationCenterCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children: Snippet<[{ unreadCount: number }]>;
	}

	let { class: className, children, onclick, ...rest }: Props = $props();

	const ctx = getNotificationCenterCtx();

	let el = $state<HTMLButtonElement>();

	$effect(() => {
		if (el) {
			ctx.triggerEl = el;
		}
	});

	function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		ctx.toggle();
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(e);
	}
</script>

<button
	bind:this={el}
	id={ctx.triggerId}
	aria-expanded={ctx.open}
	aria-haspopup="dialog"
	data-notification-center-trigger
	class={className}
	onclick={handleClick}
	{...rest}
>
	{@render children({ unreadCount: ctx.unreadCount })}
</button>

<style>
	[data-notification-center-trigger] {
		position: relative;
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2) var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-raised);
		color: var(--dry-color-text-strong);
		box-shadow: var(--dry-shadow-sm);
		font: inherit;
	}

	[data-notification-center-trigger]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}
</style>
