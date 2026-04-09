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
	<Svg viewBox="0 0 120 80" aria-label="data-grid thumbnail" width="100%" height="100%">
		<!-- Outer border -->
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Header row bg -->
		<rect
			x="8"
			y="8"
			width="104"
			height="16"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<!-- Header divider -->
		<line x1="8" y1="24" x2="112" y2="24" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<!-- Column dividers -->
		<line
			x1="44"
			y1="8"
			x2="44"
			y2="72"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.5"
		/>
		<line
			x1="80"
			y1="8"
			x2="80"
			y2="72"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.5"
		/>
		<!-- Row dividers -->
		<line
			x1="8"
			y1="38"
			x2="112"
			y2="38"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.5"
		/>
		<line
			x1="8"
			y1="52"
			x2="112"
			y2="52"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.5"
		/>
		<line
			x1="8"
			y1="66"
			x2="112"
			y2="66"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.5"
		/>
		<!-- Header labels with sort arrows -->
		<rect
			x="13"
			y="13"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.8"
		/>
		<polyline
			points="35,14 37,17 39,14"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
		/>
		<rect
			x="49"
			y="13"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.8"
		/>
		<rect
			x="85"
			y="13"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.8"
		/>
		<!-- Data cells row 1 -->
		<rect
			x="13"
			y="28"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="49"
			y="28"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="85"
			y="28"
			width="20"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Data cells row 2 -->
		<rect
			x="13"
			y="42"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="49"
			y="42"
			width="24"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="85"
			y="42"
			width="16"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Data cells row 3 -->
		<rect
			x="13"
			y="56"
			width="24"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="49"
			y="56"
			width="14"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="85"
			y="56"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
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
