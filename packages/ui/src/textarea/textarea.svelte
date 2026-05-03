<script lang="ts">
	import type { HTMLAttributes, HTMLTextareaAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '@dryui/primitives';

	type WrapperAttrs = Omit<
		HTMLAttributes<HTMLSpanElement>,
		| 'oninput'
		| 'onchange'
		| 'onfocus'
		| 'onblur'
		| 'onkeydown'
		| 'onkeyup'
		| 'autofocus'
		| 'aria-invalid'
	>;

	interface Props extends WrapperAttrs {
		value?: string;
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		name?: HTMLTextareaAttributes['name'];
		placeholder?: HTMLTextareaAttributes['placeholder'];
		readonly?: HTMLTextareaAttributes['readonly'];
		required?: HTMLTextareaAttributes['required'];
		minlength?: HTMLTextareaAttributes['minlength'];
		maxlength?: HTMLTextareaAttributes['maxlength'];
		rows?: HTMLTextareaAttributes['rows'];
		cols?: HTMLTextareaAttributes['cols'];
		wrap?: HTMLTextareaAttributes['wrap'];
		autocomplete?: HTMLTextareaAttributes['autocomplete'];
		autofocus?: HTMLTextareaAttributes['autofocus'];
		oninput?: HTMLTextareaAttributes['oninput'];
		onchange?: HTMLTextareaAttributes['onchange'];
		onfocus?: HTMLTextareaAttributes['onfocus'];
		onblur?: HTMLTextareaAttributes['onblur'];
		onkeydown?: HTMLTextareaAttributes['onkeydown'];
		onkeyup?: HTMLTextareaAttributes['onkeyup'];
		'aria-invalid'?: HTMLTextareaAttributes['aria-invalid'];
	}

	let {
		value = $bindable(''),
		size = 'md',
		class: className,
		disabled = false,
		id,
		name,
		placeholder,
		readonly,
		required,
		minlength,
		maxlength,
		rows,
		cols,
		wrap,
		autocomplete,
		autofocus,
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
</script>

<span class="wrapper {className ?? ''}" {...rest}>
	<textarea
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
		data-size={size}
		{name}
		{placeholder}
		{readonly}
		{minlength}
		{maxlength}
		{rows}
		{cols}
		{wrap}
		{autocomplete}
		{autofocus}
		{oninput}
		{onchange}
		{onfocus}
		{onblur}
		{onkeydown}
		{onkeyup}
	></textarea>
</span>

<style>
	.wrapper {
		container-type: inline-size;
		display: grid;
	}

	textarea {
		--dry-input-bg: var(--dry-textarea-bg, var(--dry-form-control-bg));
		--dry-input-border: var(--dry-textarea-border, var(--dry-form-control-border));
		--dry-input-padding-x: var(--dry-textarea-padding-x, var(--dry-form-control-padding-inline));
		--dry-input-padding-y: var(--dry-textarea-padding-y, var(--dry-form-control-padding-block));
		--dry-input-font-size: var(--dry-textarea-font-size, var(--dry-form-control-font-size));
		padding: var(--dry-input-padding-y) var(--dry-input-padding-x);
		font-size: var(--dry-input-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--dry-textarea-color, var(--dry-input-color, var(--dry-form-control-color)));
		background: var(--dry-input-bg);
		border: 1px solid var(--dry-input-border);
		border-radius: var(
			--dry-textarea-radius,
			var(--dry-input-radius, var(--dry-form-control-radius))
		);
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
		box-sizing: border-box;
		appearance: none;
		resize: vertical;
		min-height: 160px;

		&::placeholder {
			color: var(--dry-form-control-color-placeholder);
		}

		&:hover:not([data-disabled]) {
			border-color: var(--dry-form-control-border-hover);
		}

		&:focus-visible {
			outline: var(--dry-focus-ring);
			outline-offset: -1px;
			border-color: var(--dry-color-focus-ring);
			box-shadow: 0 0 0 1px var(--dry-color-focus-ring);
		}

		&[data-disabled] {
			opacity: var(--dry-state-disabled-opacity);
			cursor: not-allowed;
		}

		&[aria-invalid='true'],
		&[data-invalid] {
			--dry-input-bg: color-mix(
				in srgb,
				var(--dry-color-fill-error) 6%,
				var(--dry-color-bg-raised)
			);
			--dry-input-border: var(--dry-color-fill-error);
		}

		&[aria-invalid='true']:hover:not([data-disabled]),
		&[data-invalid]:hover:not([data-disabled]) {
			border-color: var(--dry-color-fill-error-hover);
		}

		&[aria-invalid='true']:focus-visible,
		&[data-invalid]:focus-visible {
			outline-color: var(--dry-color-fill-error);
			border-color: var(--dry-color-fill-error);
		}
	}

	textarea[data-size='sm'] {
		--dry-input-padding-x: var(--dry-space-2);
		--dry-input-padding-y: var(--dry-space-1);
		--dry-input-font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
	}

	textarea[data-size='md'] {
		--dry-input-padding-x: var(--dry-space-3);
		--dry-input-padding-y: var(--dry-space-2);
		--dry-input-font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
	}

	textarea[data-size='lg'] {
		--dry-input-padding-x: var(--dry-space-4);
		--dry-input-padding-y: var(--dry-space-2_5);
		--dry-input-font-size: var(--dry-type-heading-4-size);
		line-height: var(--dry-type-heading-4-leading);
	}

	@container (max-width: 200px) {
		textarea {
			--dry-input-padding-x: var(--dry-space-2);
		}
	}
</style>
