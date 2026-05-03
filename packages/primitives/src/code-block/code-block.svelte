<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface ShellContext {
		copied: boolean;
		handleCopy: () => void;
	}

	interface Props extends HTMLAttributes<HTMLElement> {
		code: string;
		language?: string;
		shell?: Snippet<[ShellContext]>;
		children?: Snippet;
	}

	let { code = '', language, shell, children, class: className, ...rest }: Props = $props();

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	const isSingleLine = $derived(!code.includes('\n'));

	function showCopiedFeedback() {
		copied = true;
		clearTimeout(copyTimer);
		copyTimer = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	function copyWithTextarea(value: string) {
		const textarea = document.createElement('textarea');
		textarea.value = value;
		textarea.setAttribute('readonly', '');
		textarea.style.position = 'fixed';
		textarea.style.inset = '0 auto auto 0';
		textarea.style.opacity = '0';

		document.body.appendChild(textarea);
		textarea.select();
		const copiedToClipboard = document.execCommand('copy');
		textarea.remove();

		if (!copiedToClipboard) {
			throw new Error('Unable to copy code block contents');
		}
	}

	async function copyText(value: string) {
		if (navigator.clipboard?.writeText) {
			try {
				await navigator.clipboard.writeText(value);
				return;
			} catch {
				copyWithTextarea(value);
				return;
			}
		}

		copyWithTextarea(value);
	}

	async function handleCopy() {
		try {
			await copyText(code);
			showCopiedFeedback();
		} catch (error) {
			console.warn('Failed to copy code block contents', error);
		}
	}
</script>

{#if shell}
	<div
		class={className}
		data-code-block
		data-language={language || undefined}
		data-single-line={isSingleLine || undefined}
		data-copied={copied || undefined}
		{...rest}
	>
		{@render shell({ copied, handleCopy })}
	</div>
{:else}
	<pre
		class={className}
		data-code-block
		data-language={language || undefined}
		data-single-line={isSingleLine || undefined}
		data-copied={copied || undefined}
		{...rest}>{#if children}{@render children()}{:else}<code data-language={language || undefined}
				>{code}</code
			>{/if}</pre>
{/if}
