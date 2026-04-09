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
	<Svg viewBox="0 0 120 80" aria-label="price summary panel thumbnail" width="100%" height="100%">
		<!-- Card -->
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
		<!-- Title -->
		<rect
			x="18"
			y="14"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<!-- Line items -->
		<rect
			x="18"
			y="24"
			width="40"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="84"
			y="24"
			width="18"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="18"
			y="32"
			width="32"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="86"
			y="32"
			width="16"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="18"
			y="40"
			width="44"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="88"
			y="40"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Taxes line -->
		<rect
			x="18"
			y="48"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<rect
			x="90"
			y="48"
			width="12"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<!-- Separator -->
		<line
			x1="18"
			y1="57"
			x2="102"
			y2="57"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Bold total -->
		<rect
			x="18"
			y="62"
			width="22"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="78"
			y="62"
			width="24"
			height="5"
			rx="2.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
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
