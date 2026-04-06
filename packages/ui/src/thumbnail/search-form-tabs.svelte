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
	<Svg viewBox="0 0 120 80" aria-label="search form tabs thumbnail" width="100%" height="100%">
		<!-- Tab bar -->
		<rect
			x="8"
			y="8"
			width="104"
			height="22"
			rx="5"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Active tab (Flights) -->
		<rect
			x="9"
			y="9"
			width="34"
			height="20"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect x="9" y="27" width="34" height="2" fill="var(--dry-color-fill-brand)" opacity="0.7" />
		<!-- Plane icon (active tab) -->
		<path
			d="M18 20 L22 18 L18 16 L19 17.5 L14 18 L19 18.5 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.9"
		/>
		<path d="M20 15.5 L22 16.5 L20 17" fill="var(--dry-color-fill-brand)" opacity="0.5" />
		<rect
			x="24"
			y="17"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>

		<!-- Hotel tab -->
		<path
			d="M50 20 L50 14 L58 14 L58 16 L62 16 L62 14 L70 14 L70 20"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="55"
			y="16"
			width="4"
			height="4"
			rx="0.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="61"
			y="16"
			width="4"
			height="4"
			rx="0.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>

		<!-- Car tab -->
		<path
			d="M82 20 L82 16 L84 13 L94 13 L96 16 L96 20 Z"
			fill="var(--dry-color-text-weak)"
			opacity="0.12"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			stroke-linejoin="round"
		/>
		<circle cx="84" cy="20" r="2" fill="var(--dry-color-text-weak)" opacity="0.3" />
		<circle cx="94" cy="20" r="2" fill="var(--dry-color-text-weak)" opacity="0.3" />
		<path d="M84 13 L85 16 L94 16 L93 13" fill="var(--dry-color-text-weak)" opacity="0.15" />

		<!-- Search form below tabs -->
		<rect
			x="8"
			y="34"
			width="104"
			height="38"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="14"
			y="40"
			width="44"
			height="8"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.8"
		/>
		<rect
			x="16"
			y="43"
			width="26"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="64"
			y="40"
			width="40"
			height="8"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.8"
		/>
		<rect
			x="66"
			y="43"
			width="26"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="14"
			y="54"
			width="94"
			height="10"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.75"
		/>
		<rect
			x="44"
			y="57"
			width="32"
			height="3"
			rx="1.5"
			fill="var(--dry-color-bg-raised)"
			opacity="0.8"
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
