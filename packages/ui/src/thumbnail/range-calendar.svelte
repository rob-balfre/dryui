<script lang="ts">
	import { Svg } from '@dryui/primitives';
	import { applySizeVars } from './apply-size.js';

	interface Props {
		size?: 'sm' | 'md' | 'lg' | number;
		class?: string;
	}

	let { size = 'md', class: className }: Props = $props();

	// Range: days 8–13 (index 7–12) highlighted
	const rangeStart = 7;
	const rangeEnd = 12;
</script>

<span
	data-thumbnail
	data-size={typeof size === 'string' ? size : undefined}
	class={className}
	use:applySizeVars={size}
>
	<Svg viewBox="0 0 120 80" aria-label="range-calendar thumbnail" width="100%" height="100%">
		<!-- Outer card -->
		<rect
			x="10"
			y="8"
			width="100"
			height="64"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Month header -->
		<rect
			x="10"
			y="8"
			width="100"
			height="14"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="38"
			y="12"
			width="28"
			height="5"
			rx="2"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.7"
		/>
		<!-- Day grid: 7 cols x 5 rows, range highlighted with connected band -->
		{#each Array(35) as _, i}
			{@const col = i % 7}
			{@const row = Math.floor(i / 7)}
			{@const inRange = i >= rangeStart && i <= rangeEnd}
			{@const isStartEnd = i === rangeStart || i === rangeEnd}
			<rect
				x={14 + col * 14 - (inRange && !isStartEnd ? 1 : 0)}
				y={28 + row * 10}
				width={inRange && !isStartEnd ? 10 : 8}
				height="6"
				rx={isStartEnd ? 3 : 0}
				fill={inRange ? 'var(--dry-color-fill-brand)' : 'var(--dry-color-text-weak)'}
				opacity={inRange ? (isStartEnd ? 0.85 : 0.3) : 0.2}
			/>
		{/each}
	</Svg>
</span>

<style>
	[data-thumbnail] {
		display: inline-grid;
		width: var(--thumbnail-w, 80px);
		height: var(--thumbnail-h, 53px);
	}

	[data-thumbnail][data-size='sm'] {
		--thumbnail-w: 32px;
		--thumbnail-h: 21px;
	}
	[data-thumbnail][data-size='md'] {
		--thumbnail-w: 80px;
		--thumbnail-h: 53px;
	}
	[data-thumbnail][data-size='lg'] {
		--thumbnail-w: 160px;
		--thumbnail-h: 107px;
	}
</style>
