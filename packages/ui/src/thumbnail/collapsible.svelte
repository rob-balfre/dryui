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
	<Svg viewBox="0 0 120 80" aria-label="collapsible thumbnail" width="100%" height="100%">
		<!-- Header bar -->
		<rect
			x="10"
			y="12"
			width="100"
			height="18"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="18"
			y="18"
			width="40"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Chevron down -->
		<polyline
			points="94,17 98,21 102,17"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>

		<!-- Collapsed content area (dashed) -->
		<rect
			x="10"
			y="34"
			width="100"
			height="34"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-dasharray="4,3"
		/>
		<rect
			x="18"
			y="43"
			width="52"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="18"
			y="52"
			width="38"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.28"
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
