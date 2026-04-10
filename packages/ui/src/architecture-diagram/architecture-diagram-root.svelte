<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setArchDiagramCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		layout?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let { layout = 'vertical', class: className, children, ...rest }: Props = $props();

	setArchDiagramCtx({
		get layout() {
			return layout;
		}
	});
</script>

<div
	role="img"
	data-arch-diagram
	data-layout={layout}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-arch-diagram] {
		--dry-arch-gap: var(--dry-space-4);
		--dry-arch-center-bg: var(--dry-color-fill-brand);
		--dry-arch-center-color: var(--dry-color-on-brand);
		--dry-arch-center-radius: var(--dry-radius-xl);
		--dry-arch-group-bg: var(--dry-color-fill);
		--dry-arch-group-border: var(--dry-color-stroke-weak);
		--dry-arch-group-radius: var(--dry-radius-xl);
		--dry-arch-item-bg: var(--dry-color-bg-raised);
		--dry-arch-item-border: var(--dry-color-stroke-weak);
		--dry-arch-item-radius: var(--dry-radius-lg);
		--dry-arch-arrow-color: var(--dry-color-stroke-strong);

		display: grid;
		gap: var(--dry-arch-gap);
		align-items: center;
		justify-items: center;
	}

	[data-arch-diagram][data-layout='vertical'] {
		grid-template-rows: auto auto auto;
	}

	[data-arch-diagram][data-layout='horizontal'] {
		grid-template-columns: 1fr auto 1fr;
	}
</style>
