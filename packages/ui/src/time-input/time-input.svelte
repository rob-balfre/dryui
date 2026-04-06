<script lang="ts">
	import { getFormControlCtx } from '@dryui/primitives';
	import type { TimeInputProps } from './index.js';

	let {
		value = $bindable(''),
		disabled = false,
		step,
		class: className,
		...rest
	}: TimeInputProps = $props();

	const ctx = getFormControlCtx();
	const isDisabled = $derived(disabled || ctx?.disabled || false);
</script>

<span data-time-input-wrapper>
	<input
		type="time"
		bind:value
		{step}
		id={ctx?.id}
		disabled={isDisabled}
		required={ctx?.required || undefined}
		aria-describedby={ctx?.describedBy}
		aria-invalid={ctx?.hasError || undefined}
		aria-errormessage={ctx?.errorMessageId}
		data-time-input
		data-disabled={isDisabled || undefined}
		class={className}
		{...rest}
	/>
</span>

<style>
	[data-time-input-wrapper] {
		container-type: inline-size;
		display: grid;
	}

	[data-time-input] {
		--dry-time-input-bg: var(--dry-color-bg-raised);
		--dry-time-input-border: var(--dry-color-stroke-strong);
		--dry-time-input-color: var(--dry-color-text-strong);
		--dry-time-input-radius: var(--dry-radius-md);
		--dry-time-input-padding-x: var(--dry-space-3);
		--dry-time-input-padding-y: var(--dry-space-2);
		--dry-time-input-font-size: var(--dry-type-small-size);

		padding: var(--dry-time-input-padding-y) var(--dry-time-input-padding-x);
		border: 1px solid var(--dry-time-input-border);
		border-radius: var(--dry-time-input-radius);
		background: var(--dry-time-input-bg);
		color: var(--dry-time-input-color);
		font-family: var(--dry-font-sans);
		font-size: var(--dry-time-input-font-size);
		line-height: var(--dry-type-small-leading);
		box-sizing: border-box;
		appearance: none;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);

		&::-webkit-calendar-picker-indicator {
			opacity: 0.7;
			cursor: pointer;
			filter: none;
		}

		&:hover:not([data-disabled]) {
			border-color: var(--dry-color-stroke-strong);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: -1px;
			border-color: var(--dry-color-focus-ring);
		}

		&[data-disabled] {
			opacity: 0.55;
			cursor: not-allowed;
		}
	}

	[data-time-input]::-webkit-datetime-edit-hour-field,
	[data-time-input]::-webkit-datetime-edit-minute-field,
	[data-time-input]::-webkit-datetime-edit-ampm-field {
		padding: 0;
	}

	@container (max-width: 200px) {
		[data-time-input] {
			--dry-time-input-padding-x: var(--dry-space-2);
		}
	}
</style>
