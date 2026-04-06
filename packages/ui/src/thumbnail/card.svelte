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
	<Svg viewBox="0 0 120 80" aria-label="card thumbnail" width="100%" height="100%">
		<!-- Card outer -->
		<rect
			x="10"
			y="6"
			width="100"
			height="68"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Header section -->
		<rect
			x="10"
			y="6"
			width="100"
			height="22"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<line x1="10" y1="28" x2="110" y2="28" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<rect
			x="18"
			y="14"
			width="40"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Content section -->
		<rect
			x="18"
			y="34"
			width="60"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="18"
			y="42"
			width="46"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Footer section -->
		<line x1="10" y1="58" x2="110" y2="58" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<rect
			x="18"
			y="63"
			width="28"
			height="8"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="80"
			y="63"
			width="22"
			height="8"
			rx="3"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
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
