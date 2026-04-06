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
	<Svg viewBox="0 0 120 80" aria-label="review card thumbnail" width="100%" height="100%">
		<!-- Card -->
		<rect
			x="10"
			y="8"
			width="100"
			height="64"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Stars row (3 filled, 2 empty) -->
		<path
			d="M18 20 L19.5 17 L21 20 L24 20 L21.5 22 L22.5 25 L19.5 23 L16.5 25 L17.5 22 L15 20 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.85"
		/>
		<path
			d="M27 20 L28.5 17 L30 20 L33 20 L30.5 22 L31.5 25 L28.5 23 L25.5 25 L26.5 22 L24 20 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.85"
		/>
		<path
			d="M36 20 L37.5 17 L39 20 L42 20 L39.5 22 L40.5 25 L37.5 23 L34.5 25 L35.5 22 L33 20 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.85"
		/>
		<path
			d="M45 20 L46.5 17 L48 20 L51 20 L48.5 22 L49.5 25 L46.5 23 L43.5 25 L44.5 22 L42 20 Z"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<path
			d="M54 20 L55.5 17 L57 20 L60 20 L57.5 22 L58.5 25 L55.5 23 L52.5 25 L53.5 22 L51 20 Z"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Review title -->
		<rect
			x="18"
			y="30"
			width="60"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<!-- Review text lines -->
		<rect
			x="18"
			y="38"
			width="84"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="18"
			y="44"
			width="80"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="18"
			y="50"
			width="56"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Author line -->
		<line
			x1="18"
			y1="60"
			x2="102"
			y2="60"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<circle
			cx="24"
			cy="66"
			r="5"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="33"
			y="63"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="33"
			y="68"
			width="20"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
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
