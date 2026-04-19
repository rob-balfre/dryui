<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getNotificationCenterCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children: Snippet<[{ unreadCount: number }]>;
	}

	let { children, onclick, ...rest }: Props = $props();

	const ctx = getNotificationCenterCtx();
</script>

<Button
	variant="outline"
	type="button"
	id={ctx.triggerId}
	popovertarget={ctx.panelId}
	aria-controls={ctx.panelId}
	aria-expanded={ctx.open}
	data-notification-center-trigger
	{onclick}
	{...rest}
>
	{@render children({ unreadCount: ctx.unreadCount })}
</Button>
