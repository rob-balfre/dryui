<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {}

	let { ...rest }: Props = $props();

	const ctx = getAffixGroupCtx();
</script>

<span
	aria-hidden="true"
	data-part="separator"
	data-size={ctx.size}
	data-disabled={ctx.disabled || undefined}
	data-invalid={ctx.invalid || undefined}
	{...rest}
></span>
