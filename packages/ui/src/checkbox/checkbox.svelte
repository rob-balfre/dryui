<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '@dryui/primitives';

	interface Props extends Omit<HTMLInputAttributes, 'size'> {
		checked?: boolean;
		indeterminate?: boolean;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
	}

	let {
		checked = $bindable(false),
		indeterminate = false,
		size = 'md',
		disabled = false,
		class: className,
		...rest
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	let inputEl: HTMLInputElement | undefined = $state();

	let dataState = $derived(indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked');

	$effect(() => {
		if (inputEl) {
			inputEl.indeterminate = indeterminate;
		}
	});
</script>

<span class="wrapper">
	<input
		bind:this={inputEl}
		type="checkbox"
		bind:checked
		id={ctx?.id}
		disabled={isDisabled}
		required={ctx?.required || undefined}
		aria-describedby={ctx?.describedBy}
		aria-invalid={ctx?.hasError || undefined}
		aria-errormessage={ctx?.errorMessageId}
		data-disabled={isDisabled || undefined}
		data-state={dataState}
		data-size={size}
		class={className}
		{...rest}
	/>
</span>

<style>
	.wrapper {
		display: inline-grid;
		grid-template-columns: minmax(48px, max-content);
		place-items: center;
		min-height: 48px;
	}

	input {
		--dry-checkbox-size: 20px;
		--dry-checkbox-radius: var(--dry-control-radius, var(--dry-radius-sm));
		--dry-checkbox-bg: var(--dry-control-bg, var(--dry-color-bg-raised));
		--dry-checkbox-border: var(--dry-control-border, var(--dry-color-stroke-strong));
		--dry-checkbox-check-color: var(--dry-color-on-brand);

		appearance: none;
		-webkit-appearance: none;
		display: grid;
		place-items: center;
		grid-template-columns: calc(0.35 * var(--dry-checkbox-size));
		height: var(--dry-checkbox-size);
		aspect-ratio: 1;
		margin: 0;
		padding: 0;
		border: 2px solid var(--dry-checkbox-border);
		border-radius: var(--dry-checkbox-radius);
		background: var(--dry-checkbox-bg);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default);

		&::after {
			content: '';
			display: none;
			transition: transform var(--dry-duration-fast) var(--dry-ease-spring);
		}

		&[data-state='checked'] {
			--dry-checkbox-bg: var(--dry-color-fill-selected);
			--dry-checkbox-border: var(--dry-color-stroke-selected);
			box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);

			&::after {
				display: block;
				height: 60%;
				aspect-ratio: 35 / 60;
				border: solid var(--dry-checkbox-check-color);
				border-width: 0 2px 2px 0;
				transform: rotate(45deg) scale(1) translateY(-10%);
				animation: checkScale var(--dry-duration-fast) var(--dry-ease-spring);
			}
		}

		&[data-state='indeterminate'] {
			grid-template-columns: calc(0.5 * var(--dry-checkbox-size));
			--dry-checkbox-bg: var(--dry-color-fill-selected);
			--dry-checkbox-border: var(--dry-color-stroke-selected);
			box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);

			&::after {
				display: block;
				height: 2px;
				background: var(--dry-checkbox-check-color);
				transform: scale(1);
				animation: dashScale var(--dry-duration-fast) var(--dry-ease-spring);
			}
		}

		&:hover:not([data-disabled]) {
			--dry-checkbox-border: var(--dry-color-stroke-selected);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-stroke-focus);
			outline-offset: 2px;
		}

		&[data-disabled] {
			--dry-checkbox-bg: var(--dry-color-fill-disabled);
			--dry-checkbox-border: var(--dry-color-stroke-disabled);
			--dry-checkbox-check-color: var(--dry-color-text-disabled);
			opacity: 1;
			cursor: not-allowed;
		}

		&[aria-invalid='true'],
		&[data-invalid] {
			--dry-checkbox-border: var(--dry-color-stroke-error);

			&:not([data-state='checked']):not([data-state='indeterminate']) {
				--dry-checkbox-bg: var(--dry-color-fill-error-weak);
			}
		}

		&[aria-invalid='true']:hover:not([data-disabled]),
		&[data-invalid]:hover:not([data-disabled]) {
			--dry-checkbox-border: var(--dry-color-stroke-error);
		}

		&[aria-invalid='true']:focus-visible,
		&[data-invalid]:focus-visible {
			outline-color: var(--dry-color-stroke-error);
			--dry-checkbox-border: var(--dry-color-stroke-error);
		}
	}

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	input[data-size='sm'] {
		--dry-checkbox-size: var(--dry-space-6);
		--dry-checkbox-radius: var(--dry-radius-sm);
	}

	input[data-size='md'] {
		--dry-checkbox-size: 1.75rem;
		--dry-checkbox-radius: var(--dry-radius-sm);
	}

	input[data-size='lg'] {
		--dry-checkbox-size: var(--dry-space-8);
		--dry-checkbox-radius: var(--dry-radius-md);
	}

	@keyframes checkScale {
		from {
			transform: rotate(45deg) scale(0) translateY(-10%);
		}
		to {
			transform: rotate(45deg) scale(1) translateY(-10%);
		}
	}

	@keyframes dashScale {
		from {
			transform: scale(0);
		}
		to {
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		input[data-state='checked']::after,
		input[data-state='indeterminate']::after {
			animation: none;
		}
	}
</style>
