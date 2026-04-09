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
	<Svg viewBox="0 0 120 80" aria-label="trip card thumbnail" width="100%" height="100%">
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
		<!-- Image area top -->
		<rect
			x="10"
			y="6"
			width="100"
			height="36"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<rect
			x="10"
			y="30"
			width="100"
			height="12"
			rx="0"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
		/>
		<!-- Landscape in image -->
		<path
			d="M10 38 L24 22 L36 30 L50 18 L68 28 L80 20 L110 32 L110 42 L10 42 Z"
			fill="var(--dry-color-text-weak)"
			opacity="0.12"
		/>
		<circle cx="88" cy="16" r="7" fill="var(--dry-color-text-weak)" opacity="0.2" />
		<!-- Destination text -->
		<rect
			x="18"
			y="46"
			width="54"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.65"
		/>
		<!-- Dates -->
		<rect
			x="18"
			y="55"
			width="44"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Price -->
		<rect
			x="76"
			y="52"
			width="28"
			height="9"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="79"
			y="54.5"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-bg-raised)"
			opacity="0.8"
		/>
		<!-- Badge -->
		<rect
			x="18"
			y="14"
			width="22"
			height="8"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="21"
			y="16.5"
			width="16"
			height="3"
			rx="1.5"
			fill="var(--dry-color-bg-raised)"
			opacity="0.8"
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
