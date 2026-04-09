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
	<Svg viewBox="0 0 120 80" aria-label="rich-text-editor thumbnail" width="100%" height="100%">
		<!-- Outer container -->
		<rect
			x="8"
			y="6"
			width="104"
			height="68"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Toolbar bar -->
		<rect
			x="8"
			y="6"
			width="104"
			height="18"
			rx="5"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<line x1="8" y1="24" x2="112" y2="24" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<!-- Toolbar icon squares: B, I, U, link -->
		{#each Array(4) as _, i}
			<rect
				x={14 + i * 14}
				y="10"
				width="10"
				height="10"
				rx="2"
				fill="var(--dry-color-stroke-weak)"
				opacity="0.35"
			/>
		{/each}
		<!-- Divider in toolbar -->
		<line
			x1="74"
			y1="10"
			x2="74"
			y2="20"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.4"
		/>
		{#each Array(2) as _, i}
			<rect
				x={78 + i * 14}
				y="10"
				width="10"
				height="10"
				rx="2"
				fill="var(--dry-color-stroke-weak)"
				opacity="0.25"
			/>
		{/each}
		<!-- Content area text lines -->
		<rect
			x="14"
			y="30"
			width="80"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="14"
			y="39"
			width="66"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="14"
			y="48"
			width="74"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="14"
			y="57"
			width="44"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
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
