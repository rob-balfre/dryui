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
	<Svg viewBox="0 0 120 80" aria-label="context-menu thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Right-click target area (faint) -->
		<rect
			x="8"
			y="8"
			width="55"
			height="40"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			stroke-dasharray="3,2"
		/>
		<!-- Floating context menu -->
		<rect
			x="44"
			y="24"
			width="68"
			height="52"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Menu items -->
		<rect
			x="50"
			y="30"
			width="40"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<rect
			x="50"
			y="40"
			width="34"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Separator -->
		<line x1="50" y1="50" x2="106" y2="50" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<!-- Danger item -->
		<rect
			x="50"
			y="57"
			width="28"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>
		<rect
			x="50"
			y="67"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
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
