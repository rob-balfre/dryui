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
	<Svg viewBox="0 0 120 80" aria-label="container thumbnail" width="100%" height="100%">
		<!-- Outer boundary (faint) -->
		<rect
			x="4"
			y="4"
			width="112"
			height="72"
			rx="2"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			stroke-dasharray="3 2"
			opacity="0.5"
		/>
		<!-- Left margin indicator line -->
		<line
			x1="22"
			y1="12"
			x2="22"
			y2="68"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-dasharray="2 2"
			opacity="0.6"
		/>
		<!-- Right margin indicator line -->
		<line
			x1="98"
			y1="12"
			x2="98"
			y2="68"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-dasharray="2 2"
			opacity="0.6"
		/>
		<!-- Centered inner content rect -->
		<rect
			x="22"
			y="12"
			width="76"
			height="56"
			rx="2"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Content lines inside -->
		<line
			x1="30"
			y1="28"
			x2="90"
			y2="28"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
			opacity="0.7"
		/>
		<line
			x1="30"
			y1="38"
			x2="80"
			y2="38"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.5"
		/>
		<line
			x1="30"
			y1="46"
			x2="85"
			y2="46"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.5"
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
