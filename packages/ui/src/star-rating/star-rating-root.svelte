<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		stars: number;
		label?: string;
		size?: 'sm' | 'md' | 'lg';
		variant?: 'filled' | 'outlined';
	}

	let {
		stars,
		label,
		size = 'md',
		variant = 'filled',
		class: className,
		...rest
	}: Props = $props();

	const clampedStars = $derived(Math.max(0, Math.min(5, Math.round(stars))));
	const starIndexes = [0, 1, 2, 3, 4];
	const starPath =
		'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
</script>

<div
	data-star-rating
	data-size={size}
	class={className}
	aria-label="{clampedStars} star hotel{label ? `, ${label}` : ''}"
	role="img"
	{...rest}
>
	<span data-stars>
		{#each starIndexes as i (i)}
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					d={starPath}
					data-star={i < clampedStars
						? variant === 'outlined'
							? 'outlined-active'
							: 'filled'
						: 'outlined'}
				/>
			</svg>
		{/each}
	</span>
	{#if label}
		<span data-label>{label}</span>
	{/if}
</div>

<style>
	[data-star-rating] {
		--dry-star-rating-color: #f59e0b;
		--dry-star-rating-size: 1.25rem;

		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	[data-size='sm'] {
		--dry-star-rating-size: 1rem;
	}

	[data-size='lg'] {
		--dry-star-rating-size: 1.75rem;
	}

	[data-stars] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-star-rating-gap, var(--dry-space-1));
	}

	[data-stars] svg {
		aspect-ratio: 1;
		height: var(--dry-star-rating-size);
		display: block;
	}

	[data-star='filled'] {
		fill: var(--dry-star-rating-color);
		stroke: var(--dry-star-rating-color);
		stroke-width: 1;
	}

	[data-star='outlined'] {
		fill: none;
		stroke: var(--dry-star-rating-outline-color, var(--dry-color-stroke-weak));
		stroke-width: 1.5;
	}

	[data-star='outlined-active'] {
		fill: none;
		stroke: var(--dry-star-rating-color);
		stroke-width: 1.5;
	}

	[data-label] {
		font-size: var(--dry-type-small-size);
		color: var(--dry-star-rating-label-color, var(--dry-color-text-weak));
		font-weight: 500;
	}
</style>
