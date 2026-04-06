<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		size?: 'sm' | 'md' | 'lg';
		disabled?: boolean;
		invalid?: boolean;
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let {
		size = 'md',
		disabled = false,
		invalid = false,
		orientation = 'horizontal',
		children,
		...rest
	}: Props = $props();

	setAffixGroupCtx({
		get size() {
			return size;
		},
		get disabled() {
			return disabled;
		},
		get invalid() {
			return invalid;
		},
		get orientation() {
			return orientation;
		}
	});
</script>

<div
	data-affix-group
	data-size={size}
	data-disabled={disabled || undefined}
	data-invalid={invalid || undefined}
	data-orientation={orientation}
	{...rest}
>
	{@render children()}
</div>
