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
	<Svg viewBox="0 0 120 80" aria-label="trust badges thumbnail" width="100%" height="100%">
		<!-- Badge 1 (shield with check) -->
		<path
			d="M18 16 Q18 10 24 10 Q30 10 30 16 L30 28 Q30 34 24 36 Q18 34 18 28 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.12"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
		/>
		<path
			d="M21 23 L23 25 L27 21"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="14"
			y="40"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="16"
			y="45"
			width="16"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>

		<!-- Badge 2 (lock) -->
		<rect
			x="44"
			y="20"
			width="16"
			height="12"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
		/>
		<path
			d="M47 20 Q47 14 52 14 Q57 14 57 20"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
		/>
		<circle cx="52" cy="25" r="2.5" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<rect
			x="40"
			y="40"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="44"
			y="45"
			width="16"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>

		<!-- Badge 3 (award star) -->
		<path
			d="M76 12 L78 18 L84 18 L79 22 L81 28 L76 24 L71 28 L73 22 L68 18 L74 18 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
		/>
		<rect
			x="68"
			y="40"
			width="16"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="70"
			y="45"
			width="12"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>

		<!-- Badge 4 (checkmark circle) -->
		<circle
			cx="104"
			cy="22"
			r="12"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
		/>
		<path
			d="M100 22 L103 25 L108 19"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="94"
			y="40"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="98"
			y="45"
			width="12"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>

		<!-- Separator lines between badges -->
		<line
			x1="38"
			y1="14"
			x2="38"
			y2="50"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.6"
		/>
		<line
			x1="66"
			y1="14"
			x2="66"
			y2="50"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.6"
		/>
		<line
			x1="92"
			y1="14"
			x2="92"
			y2="50"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.6"
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
