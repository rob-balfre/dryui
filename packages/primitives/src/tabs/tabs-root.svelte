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

<div data-orientation={orientation} {...rest}>
	{@render children()}
</div>
