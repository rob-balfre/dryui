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

	let {
		variant = 'info',
		dismissible = false,
		onDismiss,
		class: className,
		children,
		...rest
	}: Props = $props();

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
	<div
		role="alert"
		data-alert
		data-variant={variant}
		data-dismissible={dismissible || undefined}
		class={className}
		{...rest}
	>
		{@render children()}
	</div>
{/if}

<style>
	[data-alert] {
		--dry-alert-bg: var(--dry-color-fill-info-weak);
		--dry-alert-border: var(--dry-color-stroke-info);
		--dry-alert-icon-color: var(--dry-color-fill-info);
		--dry-radius-nested: max(
			0px,
			calc(
				var(--dry-alert-radius, var(--dry-surface-radius, var(--dry-radius-lg))) -
					var(--dry-alert-padding, var(--dry-space-6))
			)
		);

		container-type: inline-size;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: start;
		column-gap: 0;
		row-gap: var(--dry-space-1);
		padding: var(--dry-alert-padding, var(--dry-space-6));
		background: var(--dry-alert-bg);
		border: 1px solid var(--dry-alert-border);
		border-radius: var(--dry-alert-radius, var(--dry-surface-radius, var(--dry-radius-lg)));
		color: var(--dry-alert-color, var(--dry-color-text-strong));
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
		position: relative;
	}

	/* ── Variants ──────────────────────────────────────────────────────────────── */

	[data-variant='info'] {
		--dry-alert-bg: var(--dry-color-fill-info-weak);
		--dry-alert-border: var(--dry-color-stroke-info);
		--dry-alert-icon-color: var(--dry-color-fill-info);
	}

	[data-variant='success'] {
		--dry-alert-bg: var(--dry-color-fill-success-weak);
		--dry-alert-border: var(--dry-color-stroke-success);
		--dry-alert-icon-color: var(--dry-color-fill-success);
	}

	[data-variant='warning'] {
		--dry-alert-bg: var(--dry-color-fill-warning-weak);
		--dry-alert-border: var(--dry-color-stroke-warning);
		--dry-alert-icon-color: var(--dry-color-fill-warning);
	}

	[data-variant='error'] {
		--dry-alert-bg: var(--dry-color-fill-error-weak);
		--dry-alert-border: var(--dry-color-stroke-error);
		--dry-alert-icon-color: var(--dry-color-fill-error);
	}

	/* ── Responsive ────────────────────────────────────────────────────────────── */

	@container (max-width: 640px) {
		[data-alert] {
			padding: var(--dry-alert-padding, var(--dry-space-3));
		}
	}
</style>
