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
	<Svg viewBox="0 0 120 80" aria-label="accordion thumbnail" width="100%" height="100%">
		<!-- First item (collapsed) -->
		<rect
			x="10"
			y="8"
			width="100"
			height="14"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect x="16" y="13" width="36" height="4" rx="2" fill="var(--dry-color-text-weak)" />
		<!-- Chevron right (collapsed) -->
		<polyline
			points="94,12 98,15 94,18"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>

		<!-- Second item (expanded) -->
		<rect
			x="10"
			y="26"
			width="100"
			height="14"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			stroke="none"
			opacity="0.15"
		/>
		<rect
			x="10"
			y="26"
			width="100"
			height="14"
			rx="3"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
		/>
		<rect x="16" y="31" width="36" height="4" rx="2" fill="var(--dry-color-text-weak)" />
		<!-- Chevron down (expanded) -->
		<polyline
			points="92,30 96,34 100,30"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>

		<!-- Expanded content rect -->
		<rect
			x="10"
			y="41"
			width="100"
			height="18"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			stroke-dasharray="3,2"
		/>
		<rect
			x="16"
			y="46"
			width="50"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="16"
			y="52"
			width="38"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>

		<!-- Third item (collapsed) -->
		<rect
			x="10"
			y="63"
			width="100"
			height="14"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect x="16" y="68" width="36" height="4" rx="2" fill="var(--dry-color-text-weak)" />
		<polyline
			points="94,67 98,70 94,73"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
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
