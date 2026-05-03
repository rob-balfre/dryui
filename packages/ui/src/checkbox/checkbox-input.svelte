<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '@dryui/primitives';

	interface Props extends Omit<HTMLInputAttributes, 'size' | 'children'> {
		checked?: boolean;
		indeterminate?: boolean;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		children?: Snippet | undefined;
	}

	let {
		checked = $bindable(false),
		indeterminate = false,
		size = 'md',
		disabled = false,
		children,
		class: className,
		...rest
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	let dataState = $derived(indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked');

	let labeledInputEl = $state<HTMLInputElement>();
	let bareInputEl = $state<HTMLInputElement>();

	$effect(() => {
		if (labeledInputEl) labeledInputEl.indeterminate = indeterminate;
		if (bareInputEl) bareInputEl.indeterminate = indeterminate;
	});
</script>

{#if children}
	<label class="checkbox-label" data-disabled={isDisabled || undefined} data-size={size}>
		<span class="wrapper">
			<input
				bind:this={labeledInputEl}
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
		<span class="checkbox-text">{@render children()}</span>
	</label>
{:else}
	<span class="wrapper">
		<input
			bind:this={bareInputEl}
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
{/if}

<style>
	.checkbox-label {
		display: grid;
		grid-template-columns: max-content 1fr;
		align-items: center;
		gap: var(--dry-space-3);
		cursor: pointer;
	}

	.checkbox-label[data-disabled] {
		cursor: not-allowed;
	}

	.checkbox-text {
		font-size: var(--dry-text-sm-size);
		line-height: var(--dry-text-sm-leading);
		color: var(--dry-color-text-strong);
		user-select: none;
	}

	.checkbox-label[data-disabled] .checkbox-text {
		color: var(--dry-color-text-disabled);
	}

	.wrapper {
		display: inline-grid;
		grid-template-columns: minmax(48px, max-content);
		place-items: center;
		min-height: 48px;
	}

	input {
		--_checkbox-size-default: 20px;
		--_checkbox-radius-default: var(--dry-control-radius, var(--dry-radius-sm));
		--_checkbox-bg-default: var(--dry-control-bg, var(--dry-color-bg-raised));
		--_checkbox-border-default: var(--dry-control-border, var(--dry-color-stroke-strong));
		--_checkbox-check-color-default: var(--dry-color-on-brand);
		--_checkbox-size: var(--dry-checkbox-size, var(--_checkbox-size-default));
		--_checkbox-radius: var(--dry-checkbox-radius, var(--_checkbox-radius-default));
		--_checkbox-bg: var(--dry-checkbox-bg, var(--_checkbox-bg-default));
		--_checkbox-border: var(--dry-checkbox-border, var(--_checkbox-border-default));
		--_checkbox-check-color: var(--dry-checkbox-check-color, var(--_checkbox-check-color-default));

		appearance: none;
		-webkit-appearance: none;
		display: grid;
		place-items: center;
		grid-template-columns: calc(0.35 * var(--_checkbox-size));
		height: var(--_checkbox-size);
		aspect-ratio: 1;
		margin: 0;
		padding: 0;
		border: 2px solid var(--_checkbox-border);
		border-radius: var(--_checkbox-radius);
		background: var(--_checkbox-bg);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default);

		&::after {
			content: '';
			display: block;
			height: 60%;
			aspect-ratio: 35 / 60;
			border: solid transparent;
			border-width: 0 2px 2px 0;
			margin-left: calc(var(--_checkbox-size) * 0.52);
			margin-top: calc(var(--_checkbox-size) * -0.18);
			transform-origin: center;
			opacity: 0;
			transform: rotate(45deg) scale(0.25);
			filter: blur(4px);
			transition:
				opacity var(--dry-duration-fast) var(--dry-ease-spring-snappy),
				transform var(--dry-duration-fast) var(--dry-ease-spring-snappy),
				filter var(--dry-duration-fast) var(--dry-ease-spring-snappy);
		}

		&[data-state='checked'] {
			--_checkbox-bg-default: var(--dry-color-fill-selected);
			--_checkbox-border-default: var(--dry-color-stroke-selected);
			box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);

			&::after {
				border-color: var(--_checkbox-check-color);
				opacity: 1;
				transform: rotate(45deg) scale(1);
				filter: blur(0);
			}
		}

		&[data-state='indeterminate'] {
			grid-template-columns: calc(0.5 * var(--_checkbox-size));
			--_checkbox-bg-default: var(--dry-color-fill-selected);
			--_checkbox-border-default: var(--dry-color-stroke-selected);
			box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);

			&::after {
				height: 2px;
				aspect-ratio: auto;
				border: none;
				background: var(--_checkbox-check-color);
				margin-left: 0;
				margin-top: 0;
				opacity: 1;
				transform: scale(1);
				filter: blur(0);
			}
		}

		&:hover:not([data-disabled]) {
			--_checkbox-border-default: var(--dry-color-stroke-selected);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-stroke-focus);
			outline-offset: 2px;
		}

		&[data-disabled] {
			--_checkbox-bg-default: var(--dry-color-fill-disabled);
			--_checkbox-border-default: var(--dry-color-stroke-disabled);
			--_checkbox-check-color-default: var(--dry-color-text-disabled);
			opacity: 1;
			cursor: not-allowed;
		}

		&[aria-invalid='true'],
		&[data-invalid] {
			--_checkbox-border-default: var(--dry-color-stroke-error);

			&:not([data-state='checked']):not([data-state='indeterminate']) {
				--_checkbox-bg-default: var(--dry-color-fill-error-weak);
			}
		}

		&[aria-invalid='true']:hover:not([data-disabled]),
		&[data-invalid]:hover:not([data-disabled]) {
			--_checkbox-border-default: var(--dry-color-stroke-error);
		}

		&[aria-invalid='true']:focus-visible,
		&[data-invalid]:focus-visible {
			outline-color: var(--dry-color-stroke-error);
			--_checkbox-border-default: var(--dry-color-stroke-error);
		}
	}

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	input[data-size='sm'] {
		--_checkbox-size-default: var(--dry-space-6);
		--_checkbox-radius-default: var(--dry-radius-sm);
	}

	input[data-size='md'] {
		--_checkbox-size-default: 1.75rem;
		--_checkbox-radius-default: var(--dry-radius-sm);
	}

	input[data-size='lg'] {
		--_checkbox-size-default: var(--dry-space-8);
		--_checkbox-radius-default: var(--dry-radius-md);
	}

	@media (prefers-reduced-motion: reduce) {
		input::after {
			transition: none;
			filter: none;
		}
		input[data-state='checked']::after {
			transform: rotate(45deg) scale(1);
		}
		input[data-state='indeterminate']::after {
			transform: scale(1);
		}
	}
</style>
