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
	<Svg viewBox="0 0 120 80" aria-label="file-upload thumbnail" width="100%" height="100%">
		<!-- Dashed border dropzone -->
		<rect
			x="10"
			y="10"
			width="100"
			height="60"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-dasharray="5 3"
		/>
		<!-- Upload arrow (up arrow) -->
		<line
			x1="60"
			y1="48"
			x2="60"
			y2="28"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2.5"
			stroke-linecap="round"
			opacity="0.7"
		/>
		<polyline
			points="52,35 60,27 68,35"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			opacity="0.7"
		/>
		<!-- Helper text line -->
		<rect
			x="36"
			y="52"
			width="48"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
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
