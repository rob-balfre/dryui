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
	<Svg viewBox="0 0 120 80" aria-label="reveal thumbnail" width="100%" height="100%">
		<!-- Container / clip region hint -->
		<rect
			x="18"
			y="4"
			width="84"
			height="72"
			rx="5"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-dasharray="3,2"
		/>
		<!-- Partially revealed content rect (emerging from bottom) -->
		<rect
			x="28"
			y="30"
			width="64"
			height="44"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			opacity="0.9"
		/>
		<!-- Content inside -->
		<rect
			x="36"
			y="38"
			width="44"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.65"
		/>
		<rect
			x="36"
			y="47"
			width="34"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="36"
			y="55"
			width="40"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Upward arrow hinting animation -->
		<polyline
			points="60,24 60,14 56,18"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<polyline
			points="60,14 64,18"
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
