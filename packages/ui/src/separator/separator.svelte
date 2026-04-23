<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'horizontal' | 'vertical';
		variant?: 'weak' | 'strong' | 'shadow';
		decorative?: boolean;
	}

	let {
		orientation = 'horizontal',
		variant = 'weak',
		decorative = true,
		class: className,
		...rest
	}: Props = $props();
</script>

<div
	role="separator"
	aria-orientation={orientation}
	data-orientation={orientation}
	data-variant={variant}
	aria-hidden={decorative || undefined}
	class={className}
	{...rest}
></div>

<style>
	div {
		--dry-separator-color: var(--dry-color-stroke-weak);
		--dry-separator-size: 1px;
		--dry-separator-spacing: var(--dry-space-2);

		background-color: var(--dry-separator-color);
	}

	div[data-orientation='horizontal'] {
		height: var(--dry-separator-size);
		margin: var(--dry-separator-spacing) 0;
	}

	div[data-orientation='vertical'] {
		display: grid;
		grid-template-columns: var(--dry-separator-size);
		height: 100%;
		align-self: stretch;
		margin: 0 var(--dry-separator-spacing);
	}

	div[data-variant='strong'] {
		--dry-separator-color: var(--dry-color-stroke-strong);
	}

	/* ── Variant: shadow (theme-friendlier edge on image backgrounds) ─────── */

	div[data-variant='shadow'] {
		background-color: transparent;
		box-shadow: 0 1px 0 var(--dry-color-stroke-weak);
	}

	div[data-variant='shadow'][data-orientation='horizontal'] {
		height: 1px;
	}

	div[data-variant='shadow'][data-orientation='vertical'] {
		box-shadow: 1px 0 0 var(--dry-color-stroke-weak);
		grid-template-columns: 1px;
	}
</style>
