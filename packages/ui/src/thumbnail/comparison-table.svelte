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
	<Svg viewBox="0 0 120 80" aria-label="comparison table thumbnail" width="100%" height="100%">
		<!-- Table border -->
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Header row -->
		<rect
			x="8"
			y="8"
			width="104"
			height="16"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<line x1="8" y1="24" x2="112" y2="24" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<!-- Column dividers -->
		<line x1="40" y1="8" x2="40" y2="72" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<line x1="72" y1="8" x2="72" y2="72" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<!-- Header labels -->
		<rect
			x="44"
			y="13"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="76"
			y="13"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.5"
		/>
		<!-- Row 1 -->
		<rect
			x="12"
			y="29"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<path
			d="M50 31 L53 34 L58 28"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M82 31 L53 34 M58 28"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M80 29 L86 35 M86 29 L80 35"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
		/>
		<!-- Row 2 -->
		<line
			x1="8"
			y1="40"
			x2="112"
			y2="40"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<rect
			x="12"
			y="44"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<path
			d="M50 46 L53 49 L58 43"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M80 44 L86 50 M86 44 L80 50"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
		/>
		<!-- Row 3 -->
		<line
			x1="8"
			y1="56"
			x2="112"
			y2="56"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<rect
			x="12"
			y="60"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<path
			d="M50 62 L53 65 L58 59"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M50 62 L53 65 L58 59"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M80 60 L86 66 M86 60 L80 66"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			fill="none"
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
