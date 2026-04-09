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
	<Svg viewBox="0 0 120 80" aria-label="carousel thumbnail" width="100%" height="100%">
		<!-- Main content rect -->
		<rect
			x="22"
			y="10"
			width="76"
			height="52"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Image placeholder inside -->
		<rect
			x="30"
			y="18"
			width="60"
			height="30"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<!-- Mountain icon hint -->
		<polyline
			points="36,42 46,30 54,38 62,28 76,42"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- Left arrow circle -->
		<circle
			cx="12"
			cy="36"
			r="8"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<polyline
			points="14,33 10,36 14,39"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>

		<!-- Right arrow circle -->
		<circle
			cx="108"
			cy="36"
			r="8"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<polyline
			points="106,33 110,36 106,39"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>

		<!-- Pagination dots -->
		<circle cx="52" cy="70" r="3" fill="var(--dry-color-fill-brand)" />
		<circle cx="60" cy="70" r="2.5" fill="var(--dry-color-text-weak)" opacity="0.4" />
		<circle cx="68" cy="70" r="2.5" fill="var(--dry-color-text-weak)" opacity="0.4" />
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
