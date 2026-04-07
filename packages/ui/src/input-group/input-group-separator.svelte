<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getAffixGroupCtx();
</script>

<span
	aria-hidden="true"
	data-part="separator"
	data-size={ctx.size}
	data-disabled={ctx.disabled || undefined}
	data-invalid={ctx.invalid || undefined}
	data-orientation={ctx.orientation}
	{...rest}
	data-input-group-separator
	class={className}
></span>

<style>
	[data-input-group-separator] {
		align-self: stretch;
		border-inline-start: 1px solid var(--dry-input-group-separator);
	}

	[data-input-group-separator][data-orientation='horizontal'] {
		grid-column: 4;
	}

	[data-input-group-separator][data-orientation='vertical'] {
		border-inline-start: 0;
		border-top: 1px solid var(--dry-input-group-separator);
	}
</style>
