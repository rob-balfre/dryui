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
	<Svg viewBox="0 0 120 80" aria-label="qr-code thumbnail" width="100%" height="100%">
		<!-- QR outer frame -->
		<rect
			x="28"
			y="4"
			width="64"
			height="72"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>

		<!-- Top-left position square -->
		<rect
			x="34"
			y="10"
			width="18"
			height="18"
			rx="2"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="38"
			y="14"
			width="10"
			height="10"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>

		<!-- Top-right position square -->
		<rect
			x="68"
			y="10"
			width="18"
			height="18"
			rx="2"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="72"
			y="14"
			width="10"
			height="10"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>

		<!-- Bottom-left position square -->
		<rect
			x="34"
			y="52"
			width="18"
			height="18"
			rx="2"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="38"
			y="56"
			width="10"
			height="10"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>

		<!-- Data modules (scattered small squares) -->
		<rect
			x="68"
			y="34"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="75"
			y="34"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="68"
			y="41"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="75"
			y="52"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="68"
			y="59"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="75"
			y="66"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="34"
			y="34"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="42"
			y="34"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="50"
			y="34"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="58"
			y="42"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="50"
			y="50"
			width="5"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
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
