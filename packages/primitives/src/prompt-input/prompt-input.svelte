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
		placeholder = 'Type a message…',
		disabled = false,
		submitLabel = 'Send',
		onpromptsubmit,
		actions,
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
			if (textareaEl === node) {
				textareaEl = undefined;
			}
		};
	}

	$effect(() => {
		void value;
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = `${textareaEl.scrollHeight}px`;
	});
</script>

<div data-disabled={disabled || undefined} {...rest}>
	<textarea
		{@attach attachTextarea}
		bind:value
		{placeholder}
		{disabled}
		rows={1}
		data-part="input"
		onkeydown={handleKeydown}
		oninput={autoResize}
	></textarea>
	<div data-part="actions">
		{#if actions}
			{@render actions()}
		{/if}
		<button type="button" data-part="submit" {disabled} onclick={submit} aria-label={submitLabel}>
			<span data-part="submit-label">{submitLabel}</span>
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
