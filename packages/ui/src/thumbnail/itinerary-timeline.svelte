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
	<Svg viewBox="0 0 120 80" aria-label="itinerary timeline thumbnail" width="100%" height="100%">
		<!-- Vertical timeline line -->
		<line x1="28" y1="10" x2="28" y2="70" stroke="var(--dry-color-stroke-weak)" stroke-width="2" />
		<!-- Day 1 marker -->
		<circle cx="28" cy="18" r="6" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<rect
			x="38"
			y="14"
			width="18"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Event 1 -->
		<rect
			x="38"
			y="20"
			width="68"
			height="12"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="42"
			y="23"
			width="36"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="42"
			y="27"
			width="24"
			height="2"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Day 2 marker -->
		<circle cx="28" cy="42" r="6" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<rect
			x="38"
			y="38"
			width="18"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Event 2 -->
		<rect
			x="38"
			y="44"
			width="68"
			height="12"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="42"
			y="47"
			width="40"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="42"
			y="51"
			width="28"
			height="2"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Day 3 marker -->
		<circle
			cx="28"
			cy="66"
			r="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="38"
			y="62"
			width="18"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
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
