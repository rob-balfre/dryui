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
	<Svg viewBox="0 0 120 80" aria-label="dialog thumbnail" width="100%" height="100%">
		<!-- Dimmed backdrop -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-stroke-weak)" opacity="0.3" />
		<!-- Dialog card -->
		<rect
			x="18"
			y="10"
			width="84"
			height="60"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Title line -->
		<rect
			x="26"
			y="19"
			width="44"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.9"
		/>
		<!-- Close X -->
		<line
			x1="93"
			y1="17"
			x2="98"
			y2="22"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<line
			x1="98"
			y1="17"
			x2="93"
			y2="22"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<!-- Separator -->
		<line x1="18" y1="29" x2="102" y2="29" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<!-- Content lines -->
		<rect
			x="26"
			y="34"
			width="68"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="26"
			y="41"
			width="58"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="26"
			y="48"
			width="48"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Footer separator -->
		<line x1="18" y1="57" x2="102" y2="57" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<!-- Footer buttons -->
		<rect
			x="26"
			y="61"
			width="26"
			height="7"
			rx="3"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="68"
			y="61"
			width="26"
			height="7"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.85"
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
