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
	<Svg viewBox="0 0 120 80" aria-label="guest room selector thumbnail" width="100%" height="100%">
		<!-- Card -->
		<rect
			x="14"
			y="8"
			width="92"
			height="64"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Guests row -->
		<rect
			x="22"
			y="18"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Minus button -->
		<rect
			x="22"
			y="26"
			width="14"
			height="14"
			rx="3"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="26"
			y1="33"
			x2="32"
			y2="33"
			stroke="var(--dry-color-text-weak)"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<!-- Count -->
		<rect
			x="40"
			y="29"
			width="10"
			height="8"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<rect
			x="42"
			y="31"
			width="6"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Plus button -->
		<rect
			x="54"
			y="26"
			width="14"
			height="14"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<line
			x1="58"
			y1="33"
			x2="64"
			y2="33"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<line
			x1="61"
			y1="30"
			x2="61"
			y2="36"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
			stroke-linecap="round"
		/>

		<!-- Divider -->
		<line x1="22" y1="48" x2="98" y2="48" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />

		<!-- Rooms row -->
		<rect
			x="22"
			y="52"
			width="22"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Minus button -->
		<rect
			x="22"
			y="58"
			width="14"
			height="14"
			rx="3"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="26"
			y1="65"
			x2="32"
			y2="65"
			stroke="var(--dry-color-text-weak)"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<!-- Count -->
		<rect
			x="40"
			y="61"
			width="10"
			height="8"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<rect
			x="42"
			y="63"
			width="6"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Plus button -->
		<rect
			x="54"
			y="58"
			width="14"
			height="14"
			rx="3"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="58"
			y1="65"
			x2="64"
			y2="65"
			stroke="var(--dry-color-text-weak)"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<line
			x1="61"
			y1="62"
			x2="61"
			y2="68"
			stroke="var(--dry-color-text-weak)"
			stroke-width="2"
			stroke-linecap="round"
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
