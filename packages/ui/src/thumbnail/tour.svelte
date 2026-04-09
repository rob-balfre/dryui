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
	<Svg viewBox="0 0 120 80" aria-label="tour thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Page content (faint) -->
		<rect
			x="8"
			y="8"
			width="50"
			height="8"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<rect
			x="8"
			y="20"
			width="70"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<!-- Highlighted target element -->
		<rect
			x="8"
			y="30"
			width="46"
			height="20"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.1"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
		/>
		<rect
			x="14"
			y="37"
			width="28"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.5"
		/>
		<!-- Arrow from target to tooltip -->
		<line
			x1="56"
			y1="40"
			x2="62"
			y2="34"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
			opacity="0.6"
		/>
		<!-- Tooltip step card -->
		<rect
			x="62"
			y="20"
			width="50"
			height="34"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<!-- Step title -->
		<rect
			x="68"
			y="26"
			width="32"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.85"
		/>
		<!-- Step body -->
		<rect
			x="68"
			y="34"
			width="36"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="68"
			y="40"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Step indicator dots -->
		<circle cx="71" cy="63" r="3" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<circle cx="80" cy="63" r="3" fill="var(--dry-color-stroke-weak)" />
		<circle cx="89" cy="63" r="3" fill="var(--dry-color-stroke-weak)" />
		<!-- Next button -->
		<rect
			x="96"
			y="59"
			width="16"
			height="8"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
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
