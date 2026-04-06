<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();

	const ctx = getAffixGroupCtx();
</script>

<span
	data-part="prefix"
	data-size={ctx.size}
	data-disabled={ctx.disabled || undefined}
	data-invalid={ctx.invalid || undefined}
	{...rest}
	data-input-group-prefix
	class={className}
>
	{@render children()}
</span>
