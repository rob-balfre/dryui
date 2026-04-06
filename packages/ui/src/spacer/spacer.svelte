<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
		axis?: 'vertical' | 'horizontal';
	}

	let { size, axis = 'vertical', class: className, ...rest }: Props = $props();
</script>

<div
	aria-hidden="true"
	data-axis={axis}
	data-size={size || undefined}
	class={className}
	{...rest}
></div>

<style>
	div {
		min-height: 0;
	}

	div:not([data-size]) {
		grid-column: 1 / -1;
	}

	/* ── Axis ─────────────────────────────────────────────────────────────────── */

	div[data-axis='horizontal'] {
		display: inline-grid;
	}

	/* ── Sizes (vertical = height, horizontal = column track) ────────────────────────── */

	div[data-axis='vertical'][data-size='xs'] {
		height: var(--dry-space-1);
	}

	div[data-axis='vertical'][data-size='sm'] {
		height: var(--dry-space-2);
	}

	div[data-axis='vertical'][data-size='md'] {
		height: var(--dry-space-4);
	}

	div[data-axis='vertical'][data-size='lg'] {
		height: var(--dry-space-6);
	}

	div[data-axis='vertical'][data-size='xl'] {
		height: var(--dry-space-8);
	}

	div[data-axis='vertical'][data-size='2xl'] {
		height: var(--dry-space-12);
	}

	div[data-axis='horizontal'][data-size='xs'] {
		grid-template-columns: var(--dry-space-1);
	}

	div[data-axis='horizontal'][data-size='sm'] {
		grid-template-columns: var(--dry-space-2);
	}

	div[data-axis='horizontal'][data-size='md'] {
		grid-template-columns: var(--dry-space-4);
	}

	div[data-axis='horizontal'][data-size='lg'] {
		grid-template-columns: var(--dry-space-6);
	}

	div[data-axis='horizontal'][data-size='xl'] {
		grid-template-columns: var(--dry-space-8);
	}

	div[data-axis='horizontal'][data-size='2xl'] {
		grid-template-columns: var(--dry-space-12);
	}
</style>
