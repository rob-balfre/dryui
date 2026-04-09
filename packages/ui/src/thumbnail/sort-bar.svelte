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
	<Svg viewBox="0 0 120 80" aria-label="sort bar thumbnail" width="100%" height="100%">
		<!-- Bar background -->
		<rect
			x="8"
			y="28"
			width="104"
			height="24"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Active option (Best) -->
		<rect
			x="9"
			y="29"
			width="28"
			height="22"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect
			x="13"
			y="36"
			width="20"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- Active indicator bar -->
		<rect
			x="13"
			y="50"
			width="20"
			height="2"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<!-- Option 2 (Cheapest) -->
		<rect
			x="41"
			y="36"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Option 3 (Fastest) -->
		<rect
			x="69"
			y="36"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Option 4 (Rating) -->
		<rect
			x="92"
			y="36"
			width="16"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Dividers -->
		<line
			x1="38"
			y1="32"
			x2="38"
			y2="48"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<line
			x1="65"
			y1="32"
			x2="65"
			y2="48"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<line
			x1="88"
			y1="32"
			x2="88"
			y2="48"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<!-- Sort icon hint -->
		<rect
			x="14"
			y="14"
			width="20"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<rect
			x="22"
			y="62"
			width="76"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
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
