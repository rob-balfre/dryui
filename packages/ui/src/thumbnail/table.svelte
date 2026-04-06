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
	<Svg viewBox="0 0 120 80" aria-label="table thumbnail" width="100%" height="100%">
		<!-- Outer border -->
		<rect
			x="6"
			y="6"
			width="108"
			height="68"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Header bg -->
		<rect
			x="6"
			y="6"
			width="108"
			height="16"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.18"
		/>
		<!-- Row dividers -->
		<line x1="6" y1="22" x2="114" y2="22" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<line
			x1="6"
			y1="38"
			x2="114"
			y2="38"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.6"
		/>
		<line
			x1="6"
			y1="54"
			x2="114"
			y2="54"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.6"
		/>
		<!-- Col dividers -->
		<line
			x1="44"
			y1="6"
			x2="44"
			y2="74"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.4"
		/>
		<line
			x1="80"
			y1="6"
			x2="80"
			y2="74"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.4"
		/>
		<!-- Header text -->
		<rect
			x="11"
			y="12"
			width="20"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<rect
			x="49"
			y="12"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<rect
			x="85"
			y="12"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Row 1 -->
		<rect
			x="11"
			y="28"
			width="24"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="49"
			y="28"
			width="16"
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
		<!-- Row 2 -->
		<rect
			x="11"
			y="44"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="49"
			y="44"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="85"
			y="44"
			width="16"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Row 3 -->
		<rect
			x="11"
			y="60"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="49"
			y="60"
			width="14"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="85"
			y="60"
			width="18"
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
		width: var(--thumbnail-w);
		height: var(--thumbnail-h);
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
