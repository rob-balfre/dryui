<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		offset?: number;
		channels?: 'rgb' | 'rb';
		trigger?: 'hover' | 'always' | 'none';
		animated?: boolean;
		children: Snippet;
	}

	let {
		offset = 3,
		channels = 'rgb',
		trigger = 'hover',
		animated = false,
		children: childSnippet,
		class: className,
		style,
		...rest
	}: Props = $props();

	let active = $state(false);
	let prefersReducedMotion = $state(false);

	const shouldActivate = $derived.by(() => {
		if (prefersReducedMotion) return false;
		if (trigger === 'always') return true;
		if (trigger === 'none') return false;
		return active;
	});

	function handlePointerEnter() {
		if (trigger === 'hover') active = true;
	}

	function handlePointerLeave() {
		if (trigger === 'hover') active = false;
	}

	const offsetValue = $derived(`${Math.max(0, offset)}px`);

	onMount(() => {
		const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mql.matches;
		const handler = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
		};
		mql.addEventListener('change', handler);
		return () => mql.removeEventListener('change', handler);
	});

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-chromatic-offset', offsetValue);
		});
	}
</script>

<div
	data-chromatic-shift
	class={className}
	data-active={shouldActivate || undefined}
	data-channels={channels}
	data-animated={(animated && !prefersReducedMotion) || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	onpointerenter={trigger === 'hover' ? handlePointerEnter : undefined}
	onpointerleave={trigger === 'hover' ? handlePointerLeave : undefined}
	{...rest}
	use:applyStyles
>
	{#if childSnippet}
		{@render childSnippet()}
	{/if}
</div>

<style>
	[data-chromatic-shift] {
		--dry-chromatic-offset: 3px;
		position: relative;
		isolation: isolate;
		border-radius: inherit;
	}

	[data-chromatic-shift][data-active]::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: inherit;
		mix-blend-mode: screen;
		opacity: 0.6;
		pointer-events: none;
		transform: translate(var(--dry-chromatic-offset), 0);
		filter: saturate(2) hue-rotate(-30deg);
		transition: transform var(--dry-duration-fast, 120ms) var(--dry-ease-out, ease);
	}

	[data-chromatic-shift][data-active]::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: inherit;
		mix-blend-mode: screen;
		opacity: 0.6;
		pointer-events: none;
		transform: translate(calc(var(--dry-chromatic-offset) * -1), 0);
		filter: saturate(2) hue-rotate(30deg);
		transition: transform var(--dry-duration-fast, 120ms) var(--dry-ease-out, ease);
	}

	[data-chromatic-shift][data-channels='rgb'][data-active] {
		text-shadow:
			var(--dry-chromatic-offset) 0 rgba(255, 0, 0, 0.3),
			calc(var(--dry-chromatic-offset) * -1) 0 rgba(0, 0, 255, 0.3),
			0 var(--dry-chromatic-offset) rgba(0, 255, 0, 0.2);
	}

	[data-chromatic-shift][data-channels='rb'][data-active] {
		text-shadow:
			var(--dry-chromatic-offset) 0 rgba(255, 0, 0, 0.3),
			calc(var(--dry-chromatic-offset) * -1) 0 rgba(0, 0, 255, 0.3);
	}

	[data-chromatic-shift]:not([data-active])::before,
	[data-chromatic-shift]:not([data-active])::after {
		content: none;
	}

	[data-chromatic-shift]:not([data-active]) {
		text-shadow: none;
	}

	[data-chromatic-shift][data-animated]::before {
		animation: chromatic-drift-r 4s ease-in-out infinite alternate;
	}

	[data-chromatic-shift][data-animated]::after {
		animation: chromatic-drift-b 4s ease-in-out infinite alternate-reverse;
	}

	@keyframes chromatic-drift-r {
		0% {
			transform: translate(var(--dry-chromatic-offset), 0);
		}
		50% {
			transform: translate(var(--dry-chromatic-offset), calc(var(--dry-chromatic-offset) * 0.5));
		}
		100% {
			transform: translate(
				calc(var(--dry-chromatic-offset) * 0.8),
				calc(var(--dry-chromatic-offset) * -0.3)
			);
		}
	}

	@keyframes chromatic-drift-b {
		0% {
			transform: translate(calc(var(--dry-chromatic-offset) * -1), 0);
		}
		50% {
			transform: translate(
				calc(var(--dry-chromatic-offset) * -1),
				calc(var(--dry-chromatic-offset) * -0.5)
			);
		}
		100% {
			transform: translate(
				calc(var(--dry-chromatic-offset) * -0.8),
				calc(var(--dry-chromatic-offset) * 0.3)
			);
		}
	}

	[data-chromatic-shift][data-reduced-motion]::before,
	[data-chromatic-shift][data-reduced-motion]::after {
		animation: none;
		transition: none;
	}

	[data-chromatic-shift][data-reduced-motion] {
		text-shadow: none;
	}

	@media (prefers-reduced-motion: reduce) {
		[data-chromatic-shift]::before,
		[data-chromatic-shift]::after {
			animation: none;
			transition: none;
		}

		[data-chromatic-shift] {
			text-shadow: none;
		}
	}
</style>
