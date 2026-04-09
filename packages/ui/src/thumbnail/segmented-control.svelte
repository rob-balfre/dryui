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
	<Svg viewBox="0 0 120 80" aria-label="segmented-control thumbnail" width="100%" height="100%">
		<!-- Track background -->
		<rect
			x="10"
			y="28"
			width="100"
			height="24"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Active segment (middle) -->
		<rect
			x="44"
			y="31"
			width="32"
			height="18"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Segment labels -->
		<rect
			x="18"
			y="37"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="51"
			y="37"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.7"
		/>
		<rect
			x="84"
			y="37"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
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
