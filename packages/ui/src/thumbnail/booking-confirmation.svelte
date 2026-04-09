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
	<Svg viewBox="0 0 120 80" aria-label="booking confirmation thumbnail" width="100%" height="100%">
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
		<!-- Checkmark circle -->
		<circle cx="60" cy="24" r="12" fill="var(--dry-color-fill-brand)" opacity="0.15" />
		<circle
			cx="60"
			cy="24"
			r="12"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<path
			d="M54 24 L58 28 L66 20"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<!-- Detail lines -->
		<rect
			x="30"
			y="44"
			width="60"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="36"
			y="52"
			width="48"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="40"
			y="59"
			width="40"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<!-- Divider -->
		<line
			x1="20"
			y1="68"
			x2="100"
			y2="68"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			stroke-dasharray="3,2"
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
