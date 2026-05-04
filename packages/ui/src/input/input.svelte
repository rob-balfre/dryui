<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getFormControlCtx, variantAttrs } from '@dryui/primitives';
	import type { FormControlWrapperAttrs } from '../internal/form-control-wrapper-attrs.js';

	interface Props extends FormControlWrapperAttrs<HTMLSpanElement> {
		value?: string;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'default' | 'ghost';
		disabled?: boolean;
		type?: HTMLInputAttributes['type'];
		placeholder?: HTMLInputAttributes['placeholder'];
		name?: HTMLInputAttributes['name'];
		readonly?: HTMLInputAttributes['readonly'];
		required?: HTMLInputAttributes['required'];
		min?: HTMLInputAttributes['min'];
		max?: HTMLInputAttributes['max'];
		minlength?: HTMLInputAttributes['minlength'];
		maxlength?: HTMLInputAttributes['maxlength'];
		pattern?: HTMLInputAttributes['pattern'];
		step?: HTMLInputAttributes['step'];
		list?: HTMLInputAttributes['list'];
		autocomplete?: HTMLInputAttributes['autocomplete'];
		autofocus?: HTMLInputAttributes['autofocus'];
		inputmode?: HTMLInputAttributes['inputmode'];
		oninput?: HTMLInputAttributes['oninput'];
		onchange?: HTMLInputAttributes['onchange'];
		onfocus?: HTMLInputAttributes['onfocus'];
		onblur?: HTMLInputAttributes['onblur'];
		onkeydown?: HTMLInputAttributes['onkeydown'];
		onkeyup?: HTMLInputAttributes['onkeyup'];
		'aria-invalid'?: HTMLInputAttributes['aria-invalid'];
	}

	let {
		value = $bindable(''),
		size = 'md',
		variant = 'default',
		class: className,
		style,
		disabled = false,
		id,
		type,
		placeholder,
		name,
		readonly,
		required,
		min,
		max,
		minlength,
		maxlength,
		pattern,
		step,
		list,
		autocomplete,
		autofocus,
		inputmode,
		oninput,
		onchange,
		onfocus,
		onblur,
		onkeydown,
		onkeyup,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		'aria-describedby': ariaDescribedby,
		'aria-invalid': ariaInvalid,
		'aria-errormessage': ariaErrormessage,
		...rest
	}: Props = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);

	function autofocusAction(node: HTMLInputElement, enabled: HTMLInputAttributes['autofocus']) {
		if (enabled) node.focus();
		return {
			update(nextEnabled: HTMLInputAttributes['autofocus']) {
				if (nextEnabled) node.focus();
			}
		};
	}
</script>

<span class="wrapper {className ?? ''}" {style}>
	<input
		{...rest}
		{...type != null ? { type } : {}}
		use:autofocusAction={autofocus}
		bind:value
		id={id ?? ctx?.id}
		disabled={isDisabled}
		required={required ?? ctx?.required ?? undefined}
		aria-label={ariaLabel}
		aria-labelledby={ariaLabelledby}
		aria-describedby={ariaDescribedby ?? ctx?.describedBy}
		aria-invalid={ariaInvalid ?? ctx?.hasError ?? undefined}
		aria-errormessage={ariaErrormessage ?? ctx?.errorMessageId}
		data-disabled={isDisabled || undefined}
		{...variantAttrs({ size, variant: variant !== 'default' ? variant : undefined })}
		{placeholder}
		{name}
		{readonly}
		{min}
		{max}
		{minlength}
		{maxlength}
		{pattern}
		{step}
		{list}
		{autocomplete}
		{inputmode}
		{oninput}
		{onchange}
		{onfocus}
		{onblur}
		{onkeydown}
		{onkeyup}
	/>
</span>

<style>
	.wrapper {
		container-type: inline-size;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	input {
		padding: var(--dry-input-padding-y, var(--dry-form-control-padding-block))
			var(--dry-input-padding-x, var(--dry-form-control-padding-inline));
		font-size: var(--dry-input-font-size, var(--dry-form-control-font-size));
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--dry-input-color, var(--dry-form-control-color));
		background: var(--dry-input-bg, var(--dry-form-control-bg));
		border: 1px solid var(--dry-input-border, var(--dry-form-control-border));
		border-radius: var(--dry-input-radius, var(--dry-form-control-radius));
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
		box-sizing: border-box;
		appearance: none;

		&::placeholder {
			color: var(--dry-form-control-color-placeholder);
		}

		&:hover:not([data-disabled]) {
			border-color: var(--dry-form-control-border-hover);
		}

		&:focus-visible {
			outline: var(--dry-focus-ring);
			outline-offset: -1px;
			border-color: var(--dry-color-stroke-focus);
			box-shadow: 0 0 0 1px var(--dry-color-stroke-focus);
		}

		&[data-disabled] {
			--dry-input-bg: var(--dry-color-bg-sunken);
			--dry-input-border: var(--dry-color-stroke-disabled);
			--dry-input-color: var(--dry-color-text-disabled);
			cursor: not-allowed;
		}

		&[aria-invalid='true'],
		&[data-invalid] {
			--dry-input-bg: color-mix(
				in srgb,
				var(--dry-color-fill-error-weak) 70%,
				var(--dry-color-bg-raised)
			);
			--dry-input-border: var(--dry-color-stroke-error);
		}

		&[aria-invalid='true']:hover:not([data-disabled]),
		&[data-invalid]:hover:not([data-disabled]) {
			border-color: var(--dry-color-stroke-error-strong);
		}

		&[aria-invalid='true']:focus-visible,
		&[data-invalid]:focus-visible {
			outline-color: var(--dry-color-fill-error);
			border-color: var(--dry-color-stroke-error);
		}
	}

	input[data-size='sm'] {
		--dry-input-padding-x: var(--dry-space-2);
		--dry-input-padding-y: var(--dry-space-1);
		--dry-input-font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
	}

	input[data-size='md'] {
		--dry-input-padding-x: var(--dry-space-3);
		--dry-input-padding-y: var(--dry-space-2);
		--dry-input-font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
	}

	input[data-size='lg'] {
		--dry-input-padding-x: var(--dry-space-4);
		--dry-input-padding-y: var(--dry-space-2_5);
		--dry-input-font-size: var(--dry-type-heading-4-size);
		line-height: var(--dry-type-heading-4-leading);
	}

	/* ── Ghost variant ─────────────────────────────────────────────────────── */

	input[data-variant='ghost'] {
		--dry-input-bg: transparent;
		--dry-input-border: transparent;
		background: transparent;
		border-color: transparent;
	}

	input[data-variant='ghost']:hover:not(:disabled) {
		border-color: transparent;
	}

	input[data-variant='ghost']:focus-visible {
		border-color: transparent;
		outline: none;
		box-shadow: none;
	}

	/* ── File input styling ────────────────────────────────────────────────── */

	input[type='file'] {
		cursor: pointer;
		padding-top: var(--dry-space-1_5);
		padding-bottom: var(--dry-space-1_5);

		&::file-selector-button {
			font-family: var(--dry-font-sans);
			font-size: var(--dry-type-tiny-size);
			font-weight: 500;
			color: var(--dry-color-text-strong);
			background: var(--dry-color-fill-weak);
			border: 1px solid var(--dry-color-stroke-weak);
			border-radius: var(--dry-radius-full);
			padding: var(--dry-space-1) var(--dry-space-3);
			margin-right: var(--dry-space-3);
			cursor: pointer;
			transition: background var(--dry-duration-fast) var(--dry-ease-default);
		}

		&::file-selector-button:hover {
			background: var(--dry-color-fill-hover);
		}
	}

	/* Container query: collapse padding in very narrow containers */
	@container (max-width: 200px) {
		input {
			--dry-input-padding-x: var(--dry-space-2);
		}
	}
</style>
