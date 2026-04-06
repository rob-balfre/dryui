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
	<Svg viewBox="0 0 120 80" aria-label="select thumbnail" width="100%" height="100%">
		<!-- Select rect -->
		<rect
			x="10"
			y="28"
			width="100"
			height="24"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Selected value text -->
		<rect
			x="17"
			y="37"
			width="44"
			height="5"
			rx="2"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.6"
		/>
		<!-- Divider before chevron -->
		<line
			x1="96"
			y1="32"
			x2="96"
			y2="48"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.4"
		/>
		<!-- Chevron down -->
		<polyline
			points="99,37 103,41 107,37"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
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
