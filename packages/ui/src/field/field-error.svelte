<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getFormControlCtx();

	function registerError() {
		ctx?.registerError(true);
		return () => {
			ctx?.registerError(false);
		};
	}
</script>

{#if ctx?.hasError}
	<p
		{@attach registerError}
		id={ctx.errorId}
		role="alert"
		data-field-error
		class={className}
		{...rest}
	>
		{@render children()}
	</p>
{/if}

<style>
	[data-field-error] {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-tiny-size, var(--dry-type-tiny-size));
		line-height: var(--dry-type-tiny-leading, var(--dry-type-tiny-leading));
		color: var(--dry-color-text-error);
		margin: 0;
		order: 3;
	}
</style>
