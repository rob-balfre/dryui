<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getFormControlCtx } from '@dryui/primitives';

	interface Props extends HTMLButtonAttributes {
		pressed?: boolean;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		children?: Snippet;
		icon?: Snippet;
		class?: ClassValue;
	}

	type ToggleClickEvent = Parameters<NonNullable<HTMLButtonAttributes['onclick']>>[0];

	let {
		pressed = $bindable(false),
		size = 'md',
		disabled,
		class: className,
		children,
		icon,
		onclick,
		...rest
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	function handleClick(event: ToggleClickEvent) {
		onclick?.(event);

		if (event.defaultPrevented || isDisabled) {
			return;
		}

		pressed = !pressed;
	}
</script>

<span
	class={['root', className]}
	data-size={size}
	data-state={pressed ? 'on' : 'off'}
	data-disabled={isDisabled || undefined}
>
	<Button
		variant="bare"
		type="button"
		role="switch"
		aria-checked={pressed}
		id={ctx?.id}
		disabled={isDisabled}
		aria-describedby={ctx?.describedBy}
		aria-invalid={ctx?.hasError || undefined}
		aria-errormessage={ctx?.errorMessageId}
		onclick={handleClick}
		{...rest}
	>
		<span class="thumb">
			<svg viewBox="0 0 32 32" aria-hidden="true">
				<circle
					cx="16"
					cy="16"
					r="15"
					fill="var(--dry-toggle-thumb-bg, var(--dry-color-bg-raised))"
					stroke="var(--_thumb-stroke)"
				/>
			</svg>
			{#if icon}
				<span class="thumb-icon">
					{@render icon()}
				</span>
			{/if}
		</span>
	</Button>
	{#if children}
		<span class="label" data-disabled={(isDisabled && !pressed) || undefined}>
			{@render children()}
		</span>
	{/if}
</span>

<style>
	.root {
		display: inline-grid;
		grid-template-columns: var(--_track-w);
		align-items: center;
		--dry-btn-bg: var(--dry-toggle-track-bg, var(--dry-color-fill-weak));
		--dry-btn-border: var(--dry-toggle-track-stroke, var(--dry-color-stroke-strong));
		--dry-btn-radius: var(--_track-w);
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		--dry-btn-justify: start;
		--dry-btn-min-height: var(--_track-h);
	}

	.root:has(.label) {
		grid-template-columns: var(--_track-w) max-content;
		gap: var(--_gap);
		padding-inline-end: var(--_gap);
	}

	.root[data-state='on'] {
		--dry-btn-bg: var(--dry-toggle-selected-bg, var(--dry-color-fill-selected));
		--dry-btn-border: var(--dry-toggle-selected-stroke, var(--dry-color-stroke-selected));
	}

	.root[data-disabled]:not([data-state='on']) {
		--dry-btn-border: var(--dry-toggle-disabled-stroke, var(--dry-color-stroke-disabled));
	}

	.root[data-disabled][data-state='on'] {
		--dry-btn-bg: var(--dry-toggle-disabled-fill, var(--dry-color-fill-disabled));
		--dry-btn-border: var(--dry-toggle-disabled-stroke, var(--dry-color-stroke-disabled));
	}

	.thumb {
		--_thumb-stroke: var(--dry-toggle-thumb-stroke, transparent);

		display: inline-grid;
		position: relative;
		height: var(--_thumb-size);
		aspect-ratio: 1;
		border-radius: 50%;
		box-shadow: var(--dry-shadow-raised);
		transition: transform var(--dry-duration-fast) var(--dry-ease-default);
		pointer-events: none;
	}

	.root[data-state='on'] .thumb {
		--_thumb-stroke: var(
			--dry-toggle-thumb-selected-stroke,
			var(--dry-toggle-thumb-stroke, transparent)
		);
		transform: translateX(var(--_thumb-travel));
	}

	.root[data-disabled] .thumb {
		--_thumb-stroke: var(
			--dry-toggle-thumb-disabled-stroke,
			var(--dry-toggle-disabled-stroke, var(--dry-color-stroke-disabled))
		);
	}

	.thumb > svg {
		display: block;
		height: 100%;
	}

	.thumb circle {
		stroke-width: var(--dry-toggle-thumb-stroke-width, 1);
	}

	.thumb-icon {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
		color: var(--dry-color-icon);
		transition: color var(--dry-duration-fast) var(--dry-ease-default);
	}

	.root[data-state='on'] .thumb-icon {
		color: var(--dry-color-on-brand);
	}

	.root[data-disabled] .thumb-icon {
		color: var(--dry-color-text-disabled);
	}

	.label {
		font-family: var(--dry-font-sans);
		font-weight: 400;
		font-size: var(--_label-size);
		line-height: var(--_label-leading);
		color: var(--dry-toggle-label-color, var(--dry-color-text-strong));
		white-space: nowrap;
	}

	.label[data-disabled] {
		color: var(--dry-toggle-label-disabled-color, var(--dry-color-text-disabled));
	}

	.root[data-size='sm'] {
		--_track-w: 48px;
		--_track-h: 24px;
		--_thumb-size: 24px;
		--_thumb-travel: calc(48px - 24px - 2px);
		--_gap: var(--dry-space-2);
		--_label-size: var(--dry-type-tiny-size);
		--_label-leading: var(--dry-type-tiny-leading);
	}

	.root[data-size='md'] {
		--_track-w: 64px;
		--_track-h: 32px;
		--_thumb-size: 32px;
		--_thumb-travel: calc(64px - 32px - 2px);
		--_gap: var(--dry-space-3);
		--_label-size: var(--dry-type-small-size);
		--_label-leading: var(--dry-type-small-leading);
	}

	.root[data-size='lg'] {
		--_track-w: 76px;
		--_track-h: 38px;
		--_thumb-size: 36px;
		--_thumb-travel: calc(76px - 36px - 2px);
		--_gap: var(--dry-space-4);
		--_label-size: var(--dry-type-small-size);
		--_label-leading: var(--dry-type-small-leading);
	}
</style>
