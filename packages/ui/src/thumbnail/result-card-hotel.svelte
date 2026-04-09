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
	<Svg viewBox="0 0 120 80" aria-label="result card hotel thumbnail" width="100%" height="100%">
		<!-- Card -->
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Hotel image left -->
		<rect
			x="8"
			y="8"
			width="36"
			height="64"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<rect
			x="8"
			y="44"
			width="36"
			height="28"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<!-- Building silhouette in image -->
		<path
			d="M14 48 L14 36 L22 36 L22 32 L30 32 L30 36 L36 36 L36 48 Z"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<rect
			x="19"
			y="38"
			width="4"
			height="4"
			rx="0.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="25"
			y="38"
			width="4"
			height="4"
			rx="0.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Hotel name -->
		<rect
			x="50"
			y="16"
			width="52"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<!-- Stars -->
		<path
			d="M50 27 L51.5 24 L53 27 L56 27 L53.5 29 L54.5 32 L51.5 30 L48.5 32 L49.5 29 L47 27 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<path
			d="M58 27 L59.5 24 L61 27 L64 27 L61.5 29 L62.5 32 L59.5 30 L56.5 32 L57.5 29 L55 27 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<path
			d="M66 27 L67.5 24 L69 27 L72 27 L69.5 29 L70.5 32 L67.5 30 L64.5 32 L65.5 29 L63 27 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<path
			d="M74 27 L75.5 24 L77 27 L80 27 L77.5 29 L78.5 32 L75.5 30 L72.5 32 L73.5 29 L71 27 Z"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<path
			d="M82 27 L83.5 24 L85 27 L88 27 L85.5 29 L86.5 32 L83.5 30 L80.5 32 L81.5 29 L79 27 Z"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Location line -->
		<rect
			x="50"
			y="38"
			width="44"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Amenity dots -->
		<circle cx="52" cy="48" r="3" fill="var(--dry-color-text-weak)" opacity="0.2" />
		<circle cx="60" cy="48" r="3" fill="var(--dry-color-text-weak)" opacity="0.2" />
		<circle cx="68" cy="48" r="3" fill="var(--dry-color-text-weak)" opacity="0.2" />
		<!-- Price -->
		<rect
			x="78"
			y="56"
			width="28"
			height="8"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="82"
			y="58.5"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-bg-raised)"
			opacity="0.8"
		/>
		<rect
			x="50"
			y="58"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
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
