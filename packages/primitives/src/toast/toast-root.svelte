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

	let { id, variant = 'info', persistent, progress, children, ...rest }: Props = $props();

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
	data-variant={variant}
	data-toast-id={id}
	data-persistent={persistent ? '' : undefined}
	{...rest}
>
	{@render children()}
	{#if progress !== undefined}
		<div data-part="progress" use:applyProgressStyles></div>
	{/if}
</div>
