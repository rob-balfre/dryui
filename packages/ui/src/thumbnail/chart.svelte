<script lang="ts">
	import { Svg } from '@dryui/primitives';
	import { applySizeVars } from './apply-size.js';

	interface Props {
		size?: 'sm' | 'md' | 'lg' | number;
		class?: string;
	}

	let { size = 'md', class: className }: Props = $props();
</script>

<span
	data-thumbnail
	data-size={typeof size === 'string' ? size : undefined}
	class={className}
	use:applySizeVars={size}
>
	<Svg viewBox="0 0 120 80" aria-label="chart thumbnail" width="100%" height="100%">
		<!-- Baseline -->
		<line
			x1="12"
			y1="66"
			x2="110"
			y2="66"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Bar 1 -->
		<rect
			x="18"
			y="40"
			width="14"
			height="26"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.5"
		/>
		<!-- Bar 2 -->
		<rect
			x="37"
			y="24"
			width="14"
			height="42"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.75"
		/>
		<!-- Bar 3 (tallest) -->
		<rect x="56" y="14" width="14" height="52" rx="2" fill="var(--dry-color-fill-brand)" />
		<!-- Bar 4 -->
		<rect
			x="75"
			y="32"
			width="14"
			height="34"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.65"
		/>
		<!-- Bar 5 -->
		<rect
			x="94"
			y="48"
			width="14"
			height="18"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.4"
		/>
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
