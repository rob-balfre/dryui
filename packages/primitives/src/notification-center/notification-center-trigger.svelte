<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getNotificationCenterCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children: Snippet<[{ unreadCount: number }]>;
	}

	let { children, onclick, ...rest }: Props = $props();

	const ctx = getNotificationCenterCtx();

	let el = $state<HTMLButtonElement>();

	$effect(() => {
		if (el) {
			ctx.triggerEl = el;
		}
	});

</script>

<button
	bind:this={el}
	id={ctx.triggerId}
	popovertarget={ctx.panelId}
	aria-expanded={ctx.open}
	aria-haspopup="dialog"
	{onclick}
	{...rest}
>
	{@render children({ unreadCount: ctx.unreadCount })}
</button>
