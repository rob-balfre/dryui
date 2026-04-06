<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setFormControlCtx, generateFormId } from '../utils/form-control.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		error?: string;
		required?: boolean;
		disabled?: boolean;
	}

	let { children, error = '', required = false, disabled = false, ...rest }: Props = $props();

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

<div data-disabled={disabled || undefined} data-error={error ? '' : undefined} {...rest}>
	{@render children()}
</div>
