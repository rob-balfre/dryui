<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeReducedMotionPreference
	} from '../internal/motion.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		offset?: number;
		channels?: 'rgb' | 'rb';
		trigger?: 'hover' | 'always' | 'none';
		animated?: boolean;
		children?: Snippet;
	}

	let {
		offset = 3,
		channels = 'rgb',
		trigger = 'hover',
		animated = false,
		children,
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
		const stopMotionObserver = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
		});

		if (getReducedMotionPreference()) {
			prefersReducedMotion = true;
		}

		return stopMotionObserver;
	});

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-chromatic-offset', offsetValue);
		});
	}
</script>

<div
	class={['chromatic-shift', className]}
	data-active={shouldActivate || undefined}
	data-channels={channels}
	data-animated={(animated && !prefersReducedMotion) || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	onpointerenter={trigger === 'hover' ? handlePointerEnter : undefined}
	onpointerleave={trigger === 'hover' ? handlePointerLeave : undefined}
	{...rest}
	use:applyStyles
>
	{@render children?.()}
</div>

<style>
	.chromatic-shift {
		position: relative;
		isolation: isolate;
	}
</style>
