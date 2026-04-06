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
	<Svg
		viewBox="0 0 120 80"
		aria-label="multi-city search form thumbnail"
		width="100%"
		height="100%"
	>
		<!-- Row 1 -->
		<rect
			x="8"
			y="8"
			width="46"
			height="14"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="12"
			y="12"
			width="30"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="58"
			y="8"
			width="46"
			height="14"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="62"
			y="12"
			width="30"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<!-- Arrow between -->
		<path
			d="M52 15 L56 15 M54 13 L56 15 L54 17"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- Row 2 -->
		<rect
			x="8"
			y="26"
			width="46"
			height="14"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="12"
			y="30"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="58"
			y="26"
			width="46"
			height="14"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="62"
			y="30"
			width="26"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<path
			d="M52 33 L56 33 M54 31 L56 33 L54 35"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- Row 3 (third city) -->
		<rect
			x="8"
			y="44"
			width="46"
			height="14"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="12"
			y="48"
			width="32"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="58"
			y="44"
			width="46"
			height="14"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="62"
			y="48"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<path
			d="M52 51 L56 51 M54 49 L56 51 L54 53"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- Add city button -->
		<rect
			x="8"
			y="63"
			width="48"
			height="10"
			rx="3"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
			stroke-dasharray="2,1.5"
		/>
		<line
			x1="28"
			y1="68"
			x2="36"
			y2="68"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<line
			x1="32"
			y1="64"
			x2="32"
			y2="72"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<!-- Search button -->
		<rect
			x="62"
			y="63"
			width="50"
			height="10"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="72"
			y="66"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-bg-raised)"
			opacity="0.7"
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
