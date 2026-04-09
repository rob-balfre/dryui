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
	<Svg viewBox="0 0 120 80" aria-label="price calendar thumbnail" width="100%" height="100%">
		<!-- Calendar border -->
		<rect
			x="8"
			y="6"
			width="104"
			height="68"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Header -->
		<rect
			x="8"
			y="6"
			width="104"
			height="16"
			rx="5"
			fill="var(--dry-color-text-weak)"
			opacity="0.12"
		/>
		<line x1="8" y1="22" x2="112" y2="22" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<rect
			x="38"
			y="10"
			width="44"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Nav arrows -->
		<path
			d="M20 12 L16 14 L20 16"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M100 12 L104 14 L100 16"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<!-- Day headers row -->
		<rect
			x="10"
			y="24"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="26"
			y="24"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="42"
			y="24"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="58"
			y="24"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="74"
			y="24"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="90"
			y="24"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Row 1 cells with prices -->
		<rect
			x="26"
			y="30"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<rect
			x="28"
			y="33"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Cheapest cell highlighted -->
		<rect
			x="42"
			y="30"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect
			x="44"
			y="33"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<rect
			x="58"
			y="30"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<rect
			x="60"
			y="33"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="74"
			y="30"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<rect
			x="76"
			y="33"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="90"
			y="30"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<rect
			x="92"
			y="33"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Row 2 cells -->
		<rect
			x="10"
			y="43"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<rect
			x="12"
			y="46"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="26"
			y="43"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<rect
			x="28"
			y="46"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Selected cell -->
		<rect
			x="42"
			y="43"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="44"
			y="46"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-bg-raised)"
			opacity="0.8"
		/>
		<rect
			x="58"
			y="43"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<rect
			x="60"
			y="46"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="74"
			y="43"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<rect
			x="76"
			y="46"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Row 3 cells -->
		<rect
			x="10"
			y="57"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<rect
			x="12"
			y="60"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<rect
			x="26"
			y="57"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<rect
			x="28"
			y="60"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
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
