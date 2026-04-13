<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import CloseButtonBase from '../internal/close-button-base.svelte';

	export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: AlertVariant;
		dismissible?: boolean;
		onDismiss?: () => void;
		icon?: Snippet;
		title?: Snippet;
		description?: Snippet;
		children?: Snippet;
	}

	let {
		variant = 'info',
		dismissible = false,
		onDismiss,
		icon,
		title,
		description,
		children,
		class: className,
		...rest
	}: Props = $props();

	let dismissed = $state(false);

	function handleDismiss() {
		dismissed = true;
		onDismiss?.();
	}
</script>

{#if !dismissed}
	<div
		role="alert"
		data-alert
		data-variant={variant}
		data-dismissible={dismissible || undefined}
		class={className}
		{...rest}
	>
		{#if icon}
			<span data-alert-icon aria-hidden="true">
				{@render icon()}
			</span>
		{/if}

		<div data-alert-body>
			{#if title}
				<h5 data-alert-title>{@render title()}</h5>
			{/if}
			{#if description}
				<p data-alert-description>{@render description()}</p>
			{/if}
			{#if children}
				{@render children()}
			{/if}
		</div>

		{#if dismissible}
			<span data-alert-close>
				<CloseButtonBase aria-label="Dismiss alert" onclick={handleDismiss} />
			</span>
		{/if}
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

	[data-alert-icon] {
		grid-column: 1;
		color: var(--dry-alert-icon-color);
		display: grid;
		align-items: center;
		margin-top: var(--dry-space-0_5);
		padding-inline-end: var(--dry-alert-gap, var(--dry-space-3));
	}

	[data-alert-body] {
		grid-column: 2;
		display: grid;
		gap: var(--dry-space-1);
	}

	[data-alert-close] {
		grid-column: 3;
		display: inline-grid;
		align-self: start;
		margin-inline-start: var(--dry-alert-gap, var(--dry-space-3));
	}

	[data-alert-title] {
		font-size: var(--dry-type-heading-4-size);
		font-weight: 600;
		line-height: var(--dry-type-small-leading);
		color: var(--dry-color-text-strong);
		margin: 0;
	}

	[data-alert-description] {
		font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
		color: var(--dry-color-text-weak);
		margin: 0;
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
