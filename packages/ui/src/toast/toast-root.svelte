<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setToastCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		id: string;
		variant?: 'info' | 'success' | 'warning' | 'error';
		persistent?: boolean;
		progress?: number;
		children: Snippet;
	}

	let {
		id,
		variant = 'info',
		persistent,
		progress,
		class: className,
		children,
		...rest
	}: Props = $props();

	const role = $derived(variant === 'error' || variant === 'warning' ? 'alert' : 'status');
	const live = $derived(variant === 'error' || variant === 'warning' ? 'assertive' : 'polite');

	setToastCtx({
		get id() {
			return id;
		},
		get variant() {
			return variant;
		}
	});

	function applyProgressStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--progress-width', `${progress}%`);
		});
	}
</script>

<div
	{role}
	aria-live={live}
	data-part="root"
	data-variant={variant}
	data-toast-id={id}
	data-persistent={persistent ? '' : undefined}
	class={className}
	{...rest}
>
	{@render children()}
	{#if progress !== undefined}
		<div data-part="progress" {@attach applyProgressStyles}></div>
	{/if}
</div>

<style>
	[data-part='root'] {
		--dry-toast-accent: var(--dry-color-fill-info);
		--dry-radius-nested: max(0px, calc(var(--dry-radius-lg) - var(--dry-space-4)));

		position: relative;
		background: var(--dry-toast-bg, var(--dry-color-bg-overlay));
		border: 1px solid var(--dry-toast-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-radius-lg);
		box-shadow: var(--dry-shadow-lg);
		padding: var(--dry-space-4);
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: flex-start;
		gap: var(--dry-space-3);
		animation: slideIn var(--dry-duration-normal) var(--dry-ease-out);

		&[data-variant='info'] {
			--dry-toast-accent: var(--dry-color-fill-info);
			--dry-toast-bg: var(--dry-color-fill-info-weak);
			--dry-toast-border: var(--dry-color-stroke-info);
			--dry-toast-action-hover-bg: var(--dry-color-fill-info-weak);
		}

		&[data-variant='success'] {
			--dry-toast-accent: var(--dry-color-fill-success);
			--dry-toast-bg: var(--dry-color-fill-success-weak);
			--dry-toast-border: var(--dry-color-stroke-success);
			--dry-toast-action-hover-bg: var(--dry-color-fill-success-weak);
		}

		&[data-variant='warning'] {
			--dry-toast-accent: var(--dry-color-fill-warning);
			--dry-toast-bg: var(--dry-color-fill-warning-weak);
			--dry-toast-border: var(--dry-color-stroke-warning);
			--dry-toast-action-hover-bg: var(--dry-color-fill-warning-weak);
		}

		&[data-variant='error'] {
			--dry-toast-accent: var(--dry-color-fill-error);
			--dry-toast-bg: var(--dry-color-fill-error-weak);
			--dry-toast-border: var(--dry-color-stroke-error);
			--dry-toast-action-hover-bg: var(--dry-color-fill-error-weak);
		}

		@container (max-width: 300px) {
			grid-auto-flow: row;
			grid-auto-columns: initial;
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideOut {
		from {
			opacity: 1;
			transform: translateX(0);
		}
		to {
			opacity: 0;
			transform: translateX(100%);
		}
	}

	[data-part='root'][data-removing] {
		animation: slideOut var(--dry-duration-normal) var(--dry-ease-in) forwards;
	}

	@media (prefers-reduced-motion: reduce) {
		[data-part='root'] {
			animation: none;
		}
		[data-part='root'][data-removing] {
			animation: none;
		}
	}

	[data-part='progress'] {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 3px;
		display: grid;
		grid-template-columns: var(--progress-width, 0%) 1fr;
		background: var(--dry-color-stroke-weak, #e2e8f0);
		border-radius: 0 0 var(--dry-radius-lg) var(--dry-radius-lg);
		overflow: hidden;
		transition: grid-template-columns 0.3s ease;
	}

	[data-part='progress']::after {
		content: '';
		background: var(--dry-toast-accent, var(--dry-color-fill-brand, #3b82f6));
	}

	[data-part='root'][data-persistent] {
		border-left: 3px solid var(--dry-toast-accent, var(--dry-color-fill-brand, #3b82f6));
	}
</style>
