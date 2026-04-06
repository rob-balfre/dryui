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
	<Svg viewBox="0 0 120 80" aria-label="drag-and-drop thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Draggable card -->
		<rect
			x="8"
			y="18"
			width="46"
			height="32"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Grip handle lines -->
		<line
			x1="20"
			y1="29"
			x2="32"
			y2="29"
			stroke="var(--dry-color-text-weak)"
			stroke-width="2"
			stroke-linecap="round"
			opacity="0.5"
		/>
		<line
			x1="20"
			y1="34"
			x2="32"
			y2="34"
			stroke="var(--dry-color-text-weak)"
			stroke-width="2"
			stroke-linecap="round"
			opacity="0.5"
		/>
		<line
			x1="20"
			y1="39"
			x2="32"
			y2="39"
			stroke="var(--dry-color-text-weak)"
			stroke-width="2"
			stroke-linecap="round"
			opacity="0.5"
		/>
		<!-- Card content line -->
		<rect
			x="36"
			y="31"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="36"
			y="37"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Drop zone (dashed border) -->
		<rect
			x="66"
			y="18"
			width="46"
			height="44"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.06"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-dasharray="4,3"
		/>
		<!-- Drop zone inner hint -->
		<line
			x1="89"
			y1="32"
			x2="89"
			y2="46"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
			stroke-linecap="round"
			opacity="0.5"
		/>
		<line
			x1="82"
			y1="39"
			x2="96"
			y2="39"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
			stroke-linecap="round"
			opacity="0.5"
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
