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
	<Svg viewBox="0 0 120 80" aria-label="date-picker thumbnail" width="100%" height="100%">
		<!-- Input rect -->
		<rect
			x="10"
			y="6"
			width="100"
			height="20"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="17"
			y="13"
			width="50"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Calendar icon -->
		<rect
			x="94"
			y="11"
			width="10"
			height="9"
			rx="1.5"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.2"
		/>
		<line
			x1="97"
			y1="10"
			x2="97"
			y2="12"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.2"
			stroke-linecap="round"
		/>
		<line
			x1="101"
			y1="10"
			x2="101"
			y2="12"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.2"
			stroke-linecap="round"
		/>
		<!-- Dropdown calendar -->
		<rect
			x="10"
			y="30"
			width="100"
			height="46"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Month header -->
		<rect
			x="30"
			y="34"
			width="30"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Day grid 7x4 -->
		{#each Array(28) as _, i}
			{@const col = i % 7}
			{@const row = Math.floor(i / 7)}
			<rect
				x={14 + col * 13}
				y={43 + row * 8}
				width="8"
				height="5"
				rx="1.5"
				fill={i === 9 ? 'var(--dry-color-fill-brand)' : 'var(--dry-color-text-weak)'}
				opacity={i === 9 ? 0.85 : 0.25}
			/>
		{/each}
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
