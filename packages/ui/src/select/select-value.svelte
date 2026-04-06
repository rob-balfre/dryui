<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSelectCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		placeholder?: string;
	}

	let { class: className, placeholder = '', ...rest }: Props = $props();

	const ctx = getSelectCtx();
</script>

<span
	data-select-value
	data-placeholder={!ctx.displayText || undefined}
	class={className}
	{...rest}
>
	{ctx.displayText || placeholder}
</span>

<style>
	[data-select-value][data-placeholder] {
		color: var(--dry-color-text-weak);
	}
</style>
