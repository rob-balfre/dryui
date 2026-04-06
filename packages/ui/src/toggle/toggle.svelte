<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import type { HTMLButtonAttributes } from 'svelte/elements';
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

<span class={['root', className]} data-size={size}>
	<button
		type="button"
		role="switch"
		aria-checked={pressed}
		id={ctx?.id}
		disabled={isDisabled}
		aria-describedby={ctx?.describedBy}
		aria-invalid={ctx?.hasError || undefined}
		aria-errormessage={ctx?.errorMessageId}
		data-state={pressed ? 'on' : 'off'}
		data-disabled={isDisabled || undefined}
		onclick={handleClick}
		{...rest}
	>
		<span class="thumb">
			<svg viewBox="0 0 32 32" aria-hidden="true">
				<circle
					cx="16"
					cy="16"
					r="15"
					fill="var(--dry-toggle-thumb-bg)"
					stroke="var(--_thumb-stroke)"
					stroke-width="2"
				/>
			</svg>
			{#if icon}
				<span class="thumb-icon">
					{@render icon()}
				</span>
			{/if}
		</span>
	</button>
	{#if children}
		<span class="label" data-disabled={(isDisabled && !pressed) || undefined}>
			{@render children()}
		</span>
	{/if}
</span>

<style>
	/* ── Root ──────────────────────────────────────────────────────────────────── */

	.root {
		display: inline-grid;
		grid-template-columns: var(--_track-w) max-content;
		align-items: center;
		gap: var(--_gap);
		padding-inline-end: var(--_gap);
	}

	/* ── Track (the <button> element) ─────────────────────────────────────────── */

	button {
		position: relative;
		display: grid;
		align-items: center;
		height: var(--_track-h);
		border: none;
		border-radius: var(--_track-w);
		padding: 0;
		background: var(--dry-toggle-track-bg, var(--dry-control-bg, var(--dry-color-fill-weak)));
		box-shadow:
			inset 0 0 0 1px
				var(--dry-toggle-track-stroke, var(--dry-control-border, var(--dry-color-stroke-strong))),
			var(--dry-shadow-sunken);
		cursor: pointer;
		overflow: hidden;
		appearance: none;
		-webkit-appearance: none;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	button::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	button:hover:not([data-disabled])::before {
		background: var(--dry-toggle-hover-bg, var(--dry-color-fill-hover));
	}

	button:active:not([data-disabled])::before {
		background: var(--dry-toggle-press-bg, var(--dry-color-fill-active));
	}

	button:focus-visible {
		outline: 2px solid var(--dry-toggle-focus-ring, var(--dry-color-stroke-focus));
		outline-offset: 2px;
	}

	button[data-state='on']:focus-visible::before {
		background: var(--dry-toggle-press-bg, var(--dry-color-fill-active));
	}

	/* ── Selected (on) ────────────────────────────────────────────────────────── */

	button[data-state='on'] {
		background: var(--dry-toggle-selected-bg, var(--dry-color-fill-selected));
		box-shadow: none;
	}

	/* ── Disabled ─────────────────────────────────────────────────────────────── */

	button[data-disabled] {
		cursor: not-allowed;
		pointer-events: none;
	}

	/* Disabled + unselected: swap border to stroke-disabled, keep sunken shadow */
	button[data-disabled]:not([data-state='on']) {
		box-shadow:
			inset 0 0 0 1px var(--dry-toggle-disabled-stroke, var(--dry-color-stroke-disabled)),
			var(--dry-shadow-sunken);
	}

	/* Disabled + selected: muted fill instead of brand */
	button[data-disabled][data-state='on'] {
		background: var(--dry-toggle-disabled-fill, var(--dry-color-fill-disabled));
		box-shadow: none;
	}

	/* ── Thumb ─────────────────────────────────────────────────────────────────── */

	.thumb {
		--_thumb-stroke: var(--dry-toggle-track-stroke, var(--dry-color-stroke-strong));

		position: absolute;
		left: var(--_thumb-offset, 0px);
		top: var(--_thumb-offset, 0px);
		height: var(--_thumb-size);
		aspect-ratio: 1;
		border-radius: 50%;
		box-shadow: var(--dry-shadow-raised);
		transition: transform var(--dry-duration-fast) var(--dry-ease-default);
		pointer-events: none;
		z-index: 1;
	}

	button[data-state='on'] .thumb {
		--_thumb-stroke: var(--dry-toggle-selected-stroke, var(--dry-color-stroke-selected));
		transform: translateX(var(--_thumb-travel));
	}

	button[data-disabled] .thumb {
		--_thumb-stroke: var(--dry-toggle-disabled-stroke, var(--dry-color-stroke-disabled));
	}

	.thumb > svg {
		display: block;
		height: 100%;
	}

	/* ── Thumb Icon ───────────────────────────────────────────────────────────── */

	.thumb-icon {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
		color: var(--dry-color-icon);
		transition: color var(--dry-duration-fast) var(--dry-ease-default);
	}

	button[data-state='on'] .thumb-icon {
		color: var(--dry-color-text-brand);
	}

	button[data-disabled] .thumb-icon {
		color: var(--dry-color-text-disabled);
	}

	/* ── Label ─────────────────────────────────────────────────────────────────── */

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

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	.root[data-size='sm'] {
		--_track-w: 48px;
		--_track-h: 24px;
		--_thumb-size: 24px;
		--_thumb-travel: 24px;
		--_gap: var(--dry-space-2);
		--_label-size: var(--dry-type-tiny-size);
		--_label-leading: var(--dry-type-tiny-leading);
	}

	.root[data-size='md'] {
		--_track-w: 64px;
		--_track-h: 32px;
		--_thumb-size: 32px;
		--_thumb-travel: 32px;
		--_gap: var(--dry-space-3);
		--_label-size: var(--dry-type-small-size);
		--_label-leading: var(--dry-type-small-leading);
	}

	.root[data-size='lg'] {
		--_track-w: 76px;
		--_track-h: 38px;
		--_thumb-size: 36px;
		--_thumb-offset: 1px;
		--_thumb-travel: calc(76px - 36px - 2px);
		--_gap: var(--dry-space-4);
		--_label-size: var(--dry-type-small-size);
		--_label-leading: var(--dry-type-small-leading);
	}
</style>
