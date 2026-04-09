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
	<Svg viewBox="0 0 120 80" aria-label="description-list thumbnail" width="100%" height="100%">
		<!-- Row 1: label -->
		<rect
			x="12"
			y="10"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Row 1: value -->
		<rect
			x="12"
			y="17"
			width="60"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.75"
		/>
		<line
			x1="12"
			y1="25"
			x2="108"
			y2="25"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.5"
		/>

		<!-- Row 2: label -->
		<rect
			x="12"
			y="29"
			width="28"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Row 2: value -->
		<rect
			x="12"
			y="36"
			width="76"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.75"
		/>
		<line
			x1="12"
			y1="44"
			x2="108"
			y2="44"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.5"
		/>

		<!-- Row 3: label -->
		<rect
			x="12"
			y="48"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Row 3: value -->
		<rect
			x="12"
			y="55"
			width="50"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.75"
		/>
		<line
			x1="12"
			y1="63"
			x2="108"
			y2="63"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.5"
		/>

		<!-- Row 4: label -->
		<rect
			x="12"
			y="67"
			width="24"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
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
