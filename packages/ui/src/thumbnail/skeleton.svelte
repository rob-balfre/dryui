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
	<Svg viewBox="0 0 120 80" aria-label="skeleton thumbnail" width="100%" height="100%">
		<!-- Card outer -->
		<rect
			x="8"
			y="12"
			width="104"
			height="56"
			rx="5"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.5"
		/>
		<!-- Avatar circle placeholder -->
		<circle cx="28" cy="30" r="10" fill="var(--dry-color-text-weak)" opacity="0.35" />
		<!-- Title line -->
		<rect
			x="46"
			y="24"
			width="52"
			height="6"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Subtitle line -->
		<rect
			x="46"
			y="34"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<!-- Body block -->
		<rect
			x="14"
			y="48"
			width="92"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<!-- Shimmer overlay (lighter strip across center) -->
		<rect x="8" y="12" width="104" height="56" rx="5" fill="url(#shimmer)" opacity="0.15" />
		<defs>
			<linearGradient id="shimmer" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="var(--dry-color-bg-raised)" stop-opacity="0" />
				<stop offset="45%" stop-color="var(--dry-color-bg-raised)" stop-opacity="1" />
				<stop offset="55%" stop-color="var(--dry-color-bg-raised)" stop-opacity="1" />
				<stop offset="100%" stop-color="var(--dry-color-bg-raised)" stop-opacity="0" />
			</linearGradient>
		</defs>
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
