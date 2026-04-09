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
	<Svg viewBox="0 0 120 80" aria-label="promo code input thumbnail" width="100%" height="100%">
		<!-- Label -->
		<rect
			x="16"
			y="20"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Input field -->
		<rect
			x="16"
			y="30"
			width="60"
			height="22"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Tag icon suggestion -->
		<path
			d="M24 38 L24 44 L28 44 L36 36 L32 32 L24 40"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linejoin="round"
		/>
		<circle cx="30" cy="34" r="1.5" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<!-- Placeholder text -->
		<rect
			x="40"
			y="37"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Apply button -->
		<rect
			x="80"
			y="30"
			width="26"
			height="22"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.85"
		/>
		<rect
			x="84"
			y="39"
			width="18"
			height="3"
			rx="1.5"
			fill="var(--dry-color-bg-raised)"
			opacity="0.85"
		/>
		<!-- Success hint below -->
		<rect
			x="16"
			y="58"
			width="44"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.4"
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
