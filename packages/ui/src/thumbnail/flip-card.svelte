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
	<Svg viewBox="0 0 120 80" aria-label="flip-card thumbnail" width="100%" height="100%">
		<!-- Back card (offset) -->
		<rect
			x="22"
			y="18"
			width="68"
			height="48"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Back card content hint -->
		<rect
			x="30"
			y="30"
			width="40"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<rect
			x="30"
			y="38"
			width="28"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>

		<!-- Front card (overlapping, slightly offset) -->
		<rect
			x="30"
			y="10"
			width="68"
			height="48"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Front card content -->
		<rect
			x="40"
			y="22"
			width="38"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.65"
		/>
		<rect
			x="40"
			y="31"
			width="28"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="40"
			y="39"
			width="32"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Flip arrow hint -->
		<path
			d="M90,14 Q96,10 96,16"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<polyline
			points="94,16 96,16 96,12"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
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
