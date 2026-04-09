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
	<Svg viewBox="0 0 120 80" aria-label="number-input thumbnail" width="100%" height="100%">
		<!-- Decrement button -->
		<rect
			x="8"
			y="28"
			width="22"
			height="24"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="14"
			y1="40"
			x2="24"
			y2="40"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<!-- Value input -->
		<rect
			x="34"
			y="28"
			width="52"
			height="24"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="50"
			y="37"
			width="20"
			height="5"
			rx="2"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.6"
		/>
		<!-- Increment button -->
		<rect
			x="90"
			y="28"
			width="22"
			height="24"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="96"
			y1="40"
			x2="106"
			y2="40"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<line
			x1="101"
			y1="35"
			x2="101"
			y2="45"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="2"
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
