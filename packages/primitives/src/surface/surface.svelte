<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { SurfaceElement } from './index.js';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: SurfaceElement;
		background?: string;
		className?: HTMLAttributes<HTMLElement>['class'];
		children?: Snippet;
	}

	let {
		as = 'div',
		background,
		children,
		class: classAttr,
		className = classAttr,
		style,
		...rest
	}: Props = $props();

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			if (background) node.style.setProperty('--dry-surface-bg', background);
		});
	}
</script>

{#if as === 'span'}
	<span class={['surface', className]} {@attach applyStyles} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</span>
{:else if as === 'header'}
	<header class={['surface', className]} {@attach applyStyles} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</header>
{:else if as === 'nav'}
	<nav class={['surface', className]} {@attach applyStyles} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</nav>
{:else if as === 'main'}
	<main class={['surface', className]} {@attach applyStyles} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</main>
{:else if as === 'footer'}
	<footer class={['surface', className]} {@attach applyStyles} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</footer>
{:else if as === 'section'}
	<section class={['surface', className]} {@attach applyStyles} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</section>
{:else}
	<div class={['surface', className]} {@attach applyStyles} {...rest}>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}

<style>
	:where(.surface) {
		block-size: var(--dry-surface-block-size, auto);
		min-block-size: var(--dry-surface-min-block-size, 0);
		min-height: var(--dry-surface-min-height, auto);
		display: var(--dry-surface-display, block);
		position: relative;
		isolation: isolate;
		overflow: var(--dry-surface-overflow, hidden);
		padding: var(--dry-surface-padding, 0);
		background: var(--dry-surface-bg, transparent);
	}

	span:where(.surface) {
		display: var(--dry-surface-display, inline);
	}
</style>
