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
	<Svg viewBox="0 0 120 80" aria-label="image-comparison thumbnail" width="100%" height="100%">
		<!-- Left panel (before) -->
		<rect
			x="8"
			y="8"
			width="52"
			height="64"
			rx="5"
			fill="var(--dry-color-text-weak)"
			opacity="0.18"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<polygon points="14,56 26,32 38,44 50,56" fill="var(--dry-color-text-weak)" opacity="0.3" />

		<!-- Right panel (after) -->
		<rect
			x="60"
			y="8"
			width="52"
			height="64"
			rx="5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.12"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<polygon points="66,56 78,28 92,40 104,56" fill="var(--dry-color-fill-brand)" opacity="0.25" />

		<!-- Divider line -->
		<line x1="60" y1="8" x2="60" y2="72" stroke="var(--dry-color-stroke-weak)" stroke-width="2" />
		<!-- Slider handle -->
		<circle
			cx="60"
			cy="40"
			r="8"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="2"
		/>
		<!-- Handle arrows -->
		<polyline
			points="56,38 53,40 56,42"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<polyline
			points="64,38 67,40 64,42"
			fill="none"
			stroke="var(--dry-color-text-weak)"
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
