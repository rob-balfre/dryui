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
	/* outer: var(--dry-radius-toast); children inside the padded region use var(--dry-radius-nested-toast). */
	[data-part='root'] {
		--dry-toast-accent: var(--dry-color-fill-info);
		--dry-radius-nested: max(
			var(--dry-radius-sm),
			calc(var(--dry-radius-toast) - var(--dry-space-4))
		);
		--dry-btn-radius: var(--dry-radius-nested);

		position: relative;
		background: var(--dry-toast-bg, var(--dry-color-bg-overlay));
		border: 1px solid var(--dry-toast-border, var(--dry-color-stroke-weak));
		border-radius: var(--dry-radius-toast);
		box-shadow: var(--dry-shadow-lg);
		padding: var(--dry-space-4);
		padding-right: calc(var(--dry-space-4) + var(--dry-space-12) + var(--dry-space-2));
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: start;
		gap: var(--dry-space-2);
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
		border-radius: 0 0 var(--dry-radius-toast) var(--dry-radius-toast);
		overflow: hidden;
		transition: grid-template-columns var(--dry-duration-normal) var(--dry-ease-default);
	}

	[data-part='progress']::after {
		content: '';
		background: var(--dry-toast-accent, var(--dry-color-fill-brand, #3b82f6));
	}

	[data-part='root'][data-persistent] {
		border-left: 3px solid var(--dry-toast-accent, var(--dry-color-fill-brand, #3b82f6));
	}
</style>
