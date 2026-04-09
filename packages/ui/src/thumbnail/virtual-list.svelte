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
	<Svg viewBox="0 0 120 80" aria-label="virtual-list thumbnail" width="100%" height="100%">
		<!-- Top faded row -->
		<rect
			x="10"
			y="4"
			width="100"
			height="10"
			rx="2.5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.35"
		/>
		<rect
			x="18"
			y="7"
			width="40"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>

		<!-- Visible rows (full opacity) -->
		<rect
			x="10"
			y="18"
			width="100"
			height="12"
			rx="2.5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="18"
			y="22"
			width="52"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.65"
		/>

		<rect
			x="10"
			y="33"
			width="100"
			height="12"
			rx="2.5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="18"
			y="37"
			width="44"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.65"
		/>

		<rect
			x="10"
			y="48"
			width="100"
			height="12"
			rx="2.5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="18"
			y="52"
			width="60"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.65"
		/>

		<!-- Bottom faded rows -->
		<rect
			x="10"
			y="63"
			width="100"
			height="10"
			rx="2.5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.45"
		/>
		<rect
			x="18"
			y="66"
			width="36"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>

		<rect
			x="10"
			y="75"
			width="100"
			height="6"
			rx="2"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.2"
		/>

		<!-- Scrollbar -->
		<rect
			x="112"
			y="4"
			width="4"
			height="72"
			rx="2"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.3"
		/>
		<rect
			x="112"
			y="18"
			width="4"
			height="28"
			rx="2"
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
