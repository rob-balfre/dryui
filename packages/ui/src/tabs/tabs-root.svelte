<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTabsCtx, generateTabsId } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		orientation?: 'horizontal' | 'vertical';
		activationMode?: 'automatic' | 'manual';
		children: Snippet;
	}

	let {
		value = $bindable(''),
		orientation = 'horizontal',
		activationMode = 'automatic',
		class: className,
		children,
		...rest
	}: Props = $props();

	const id = generateTabsId();

	setTabsCtx({
		id,
		get value() {
			return value;
		},
		get orientation() {
			return orientation;
		},
		get activationMode() {
			return activationMode;
		},
		select(v: string) {
			value = v;
		}
	});
</script>

<div data-tabs-root data-orientation={orientation} class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-tabs-root] {
		--dry-tabs-trigger-border-bottom: 4px solid transparent;
		--dry-tabs-trigger-border-right: none;
		--dry-tabs-trigger-active-border-bottom-color: var(--dry-color-stroke-selected);
		--dry-tabs-trigger-active-border-right-color: transparent;
	}

	[data-tabs-root][data-orientation='vertical'] {
		--dry-tabs-trigger-border-bottom: none;
		--dry-tabs-trigger-border-right: 4px solid transparent;
		--dry-tabs-trigger-active-border-bottom-color: transparent;
		--dry-tabs-trigger-active-border-right-color: var(--dry-color-stroke-selected);
	}
</style>
