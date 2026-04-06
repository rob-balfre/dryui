<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		submitLabel?: string;
		onpromptsubmit?: (value: string) => void;
		actions?: Snippet;
	}

	let {
		value = $bindable(''),
		placeholder = 'Type a message...',
		disabled = false,
		submitLabel = 'Send',
		onpromptsubmit,
		actions,
		class: className,
		...rest
	}: Props = $props();

	let textareaEl: HTMLTextAreaElement | undefined;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			submit();
		}
	}

	function submit() {
		if (disabled) return;
		const nextValue = value.trim();
		if (!nextValue) {
			textareaEl?.focus();
			return;
		}
		onpromptsubmit?.(nextValue);
	}

	function autoResize() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = `${textareaEl.scrollHeight}px`;
	}

	function attachTextarea(node: HTMLTextAreaElement) {
		textareaEl = node;
		autoResize();
		return () => {
			if (textareaEl === node) textareaEl = undefined;
		};
	}

	$effect(() => {
		void value;
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = `${textareaEl.scrollHeight}px`;
	});
</script>

<div class={className} data-prompt-input data-disabled={disabled || undefined} {...rest}>
	<textarea
		{@attach attachTextarea}
		bind:value
		{placeholder}
		{disabled}
		rows={1}
		data-prompt-textarea
		onkeydown={handleKeydown}
		oninput={autoResize}
	></textarea>
	<div data-prompt-actions>
		{#if actions}
			{@render actions()}
		{/if}
		<button type="button" data-prompt-submit {disabled} onclick={submit} aria-label={submitLabel}>
			<span data-prompt-submit-label>{submitLabel}</span>
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 10L3 17l14-7L3 3l2 7zm0 0h6" />
			</svg>
		</button>
	</div>
</div>

<style>
	[data-prompt-input] {
		--dry-prompt-input-bg: var(--dry-color-bg-raised);
		--dry-prompt-input-border: var(--dry-color-stroke-strong);
		--dry-prompt-input-color: var(--dry-color-text-strong);
		--dry-prompt-input-radius: var(--dry-radius-lg);
		--dry-prompt-input-padding: var(--dry-space-3);
		--dry-prompt-input-gap: var(--dry-space-2);
		--dry-prompt-input-textarea-min-height: 3.25rem;
		--dry-prompt-input-action-bg: var(--dry-color-fill-brand);
		--dry-prompt-input-action-color: var(--dry-color-on-brand);
		--dry-prompt-input-action-radius: 9999px;

		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		grid-template-columns: 1fr;
		align-items: end;
		gap: var(--dry-prompt-input-gap);
		padding: var(--dry-prompt-input-padding);
		border: 1px solid var(--dry-prompt-input-border);
		border-radius: var(--dry-prompt-input-radius);
		background: var(--dry-prompt-input-bg);
		color: var(--dry-prompt-input-color);
		font-family: var(--dry-font-sans);
		box-sizing: border-box;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-prompt-input]:focus-within:not([data-disabled]) {
		border-color: var(--dry-color-focus-ring);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--dry-color-focus-ring) 22%, transparent);
	}

	[data-prompt-input][data-disabled] {
		opacity: 0.55;
		cursor: not-allowed;
	}

	[data-prompt-textarea] {
		min-height: var(--dry-prompt-input-textarea-min-height);
		padding: 0;
		border: none;
		outline: none;
		resize: none;
		background: transparent;
		color: inherit;
		font: inherit;
		line-height: var(--dry-type-small-leading, var(--dry-text-sm-leading));
	}

	[data-prompt-textarea]::placeholder {
		color: var(--dry-color-text-weak);
	}

	[data-prompt-actions] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: end;
		gap: var(--dry-space-2);
	}

	[data-prompt-submit] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-template-columns: minmax(var(--dry-space-12), max-content);
		place-items: center;
		height: var(--dry-space-12);
		padding-inline: var(--dry-space-4);
		gap: var(--dry-space-2);
		border: none;
		border-radius: var(--dry-prompt-input-action-radius);
		background: var(--dry-prompt-input-action-bg);
		color: var(--dry-prompt-input-action-color);
		cursor: pointer;
		font: inherit;
		font-weight: 600;
		transition:
			transform var(--dry-duration-fast) var(--dry-ease-default),
			opacity var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-prompt-submit-label] {
		white-space: nowrap;
	}

	[data-prompt-submit]:hover:not([disabled]) {
		transform: translateY(-1px);
	}

	[data-prompt-submit]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	[data-prompt-submit][disabled] {
		opacity: 0.55;
		cursor: not-allowed;
		transform: none;
	}
</style>
