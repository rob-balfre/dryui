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
	<Svg viewBox="0 0 120 80" aria-label="add-on selector thumbnail" width="100%" height="100%">
		<!-- Card 1 (checked) -->
		<rect
			x="8"
			y="8"
			width="32"
			height="30"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<circle cx="32" cy="14" r="6" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<path
			d="M29 14 L31 16 L35 12"
			stroke="var(--dry-color-bg-raised)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="12"
			y="25"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Card 2 (checked) -->
		<rect
			x="44"
			y="8"
			width="32"
			height="30"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<circle cx="68" cy="14" r="6" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<path
			d="M65 14 L67 16 L71 12"
			stroke="var(--dry-color-bg-raised)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="48"
			y="25"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Card 3 (unchecked) -->
		<rect
			x="80"
			y="8"
			width="32"
			height="30"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<circle
			cx="104"
			cy="14"
			r="6"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="84"
			y="25"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Card 4 (unchecked) -->
		<rect
			x="8"
			y="42"
			width="32"
			height="30"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<circle
			cx="32"
			cy="48"
			r="6"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="12"
			y="59"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Card 5 (unchecked) -->
		<rect
			x="44"
			y="42"
			width="32"
			height="30"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<circle
			cx="68"
			cy="48"
			r="6"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="48"
			y="59"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Card 6 (checked) -->
		<rect
			x="80"
			y="42"
			width="32"
			height="30"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<circle cx="104" cy="48" r="6" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<path
			d="M101 48 L103 50 L107 46"
			stroke="var(--dry-color-bg-raised)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="84"
			y="59"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
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
