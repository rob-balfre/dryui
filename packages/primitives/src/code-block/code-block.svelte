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

	function handleCopy() {
		navigator.clipboard.writeText(code).then(() => {
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => {
				copied = false;
			}, 2000);
		});
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
