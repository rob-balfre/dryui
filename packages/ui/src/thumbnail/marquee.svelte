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
	<Svg viewBox="0 0 120 80" aria-label="marquee thumbnail" width="100%" height="100%">
		<!-- Track -->
		<rect
			x="8"
			y="28"
			width="104"
			height="24"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Fade edges -->
		<rect
			x="8"
			y="28"
			width="18"
			height="24"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			opacity="0.7"
		/>
		<rect
			x="94"
			y="28"
			width="18"
			height="24"
			rx="4 4 4 4"
			fill="var(--dry-color-bg-raised)"
			opacity="0.7"
		/>
		<!-- Items inside -->
		<rect
			x="18"
			y="34"
			width="26"
			height="12"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="50"
			y="34"
			width="22"
			height="12"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="78"
			y="34"
			width="26"
			height="12"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Motion arrow -->
		<polyline
			points="100,36 106,40 100,44"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
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
