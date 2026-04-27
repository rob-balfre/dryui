<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFormControlCtx } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getFormControlCtx();

	let el = $state<HTMLParagraphElement>();

	$effect(() => {
		if (!el) return;
		ctx?.registerDescription(true);
		return () => {
			ctx?.registerDescription(false);
		};
	});
</script>

<p bind:this={el} id={ctx?.descriptionId} data-field-description class={className} {...rest}>
	{@render children()}
</p>

<style>
	[data-field-description] {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-tiny-size, var(--dry-type-tiny-size));
		line-height: var(--dry-type-tiny-leading, var(--dry-type-tiny-leading));
		color: var(--dry-color-text-weak);
		margin: 0;
		order: 2;
	}
</style>
