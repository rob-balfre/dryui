<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setAlertCtx, type AlertVariant } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: AlertVariant;
		dismissible?: boolean;
		onDismiss?: () => void;
		children: Snippet;
	}

	let { variant = 'info', dismissible = false, onDismiss, children, ...rest }: Props = $props();

	let isDismissed = $state(false);

	setAlertCtx({
		get variant() {
			return variant;
		},
		get isDismissed() {
			return isDismissed;
		},
		dismiss() {
			isDismissed = true;
			onDismiss?.();
		}
	});
</script>

{#if !isDismissed}
	<div role="alert" data-variant={variant} data-dismissible={dismissible || undefined} {...rest}>
		{@render children()}
	</div>
{/if}
