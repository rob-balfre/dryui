<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setFormControlCtx, generateFormId } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		error?: string;
		required?: boolean;
		disabled?: boolean;
	}

	let {
		children,
		error = '',
		required = false,
		disabled = false,
		class: className,
		...rest
	}: Props = $props();

	const id = generateFormId('field');
	let hasDescription = $state(false);
	let hasErrorMessage = $state(false);

	setFormControlCtx({
		get id() {
			return id;
		},
		get labelId() {
			return `${id}-label`;
		},
		get descriptionId() {
			return `${id}-description`;
		},
		get errorId() {
			return `${id}-error`;
		},
		get describedBy() {
			return hasDescription ? `${id}-description` : undefined;
		},
		get errorMessageId() {
			return error && hasErrorMessage ? `${id}-error` : undefined;
		},
		get error() {
			return error;
		},
		get required() {
			return required;
		},
		get disabled() {
			return disabled;
		},
		get hasError() {
			return !!error;
		},
		registerDescription(mounted) {
			hasDescription = mounted;
		},
		registerError(mounted) {
			hasErrorMessage = mounted;
		}
	});
</script>

<div
	data-field
	data-disabled={disabled || undefined}
	data-error={error ? '' : undefined}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-field] {
		--dry-field-gap: var(--dry-space-1_5);
		display: grid;
		gap: var(--dry-field-gap);

		&[data-disabled] {
			opacity: 0.5;
		}

		&[data-error] {
			--dry-field-gap: var(--dry-space-1);
		}
	}
</style>
