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
	<Svg viewBox="0 0 120 80" aria-label="multi-select-combobox thumbnail" width="100%" height="100%">
		<!-- Input rect -->
		<rect
			x="10"
			y="22"
			width="100"
			height="26"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Pill chip 1 -->
		<rect
			x="16"
			y="29"
			width="24"
			height="11"
			rx="5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
		/>
		<rect
			x="19"
			y="33"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- x on chip 1 -->
		<line
			x1="35"
			y1="32"
			x2="37"
			y2="34"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
			stroke-linecap="round"
			opacity="0.7"
		/>
		<line
			x1="37"
			y1="32"
			x2="35"
			y2="34"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
			stroke-linecap="round"
			opacity="0.7"
		/>
		<!-- Pill chip 2 -->
		<rect
			x="43"
			y="29"
			width="26"
			height="11"
			rx="5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
		/>
		<rect
			x="46"
			y="33"
			width="16"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- x on chip 2 -->
		<line
			x1="64"
			y1="32"
			x2="66"
			y2="34"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
			stroke-linecap="round"
			opacity="0.7"
		/>
		<line
			x1="66"
			y1="32"
			x2="64"
			y2="34"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
			stroke-linecap="round"
			opacity="0.7"
		/>
		<!-- Chevron down -->
		<polyline
			points="97,32 102,37 107,32"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
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
