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
	<Svg viewBox="0 0 120 80" aria-label="map thumbnail" width="100%" height="100%">
		<!-- Map frame -->
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Grid lines (map texture) -->
		<line
			x1="8"
			y1="35"
			x2="112"
			y2="35"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.4"
		/>
		<line
			x1="8"
			y1="50"
			x2="112"
			y2="50"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.4"
		/>
		<line
			x1="40"
			y1="8"
			x2="40"
			y2="72"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.4"
		/>
		<line
			x1="72"
			y1="8"
			x2="72"
			y2="72"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.4"
		/>
		<!-- Road lines -->
		<path
			d="M8,40 Q40,30 60,40 Q80,50 112,42"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="2.5"
			opacity="0.3"
			stroke-linecap="round"
		/>
		<!-- Map pin -->
		<circle cx="60" cy="34" r="7" fill="var(--dry-color-fill-brand)" opacity="0.85" />
		<circle cx="60" cy="34" r="3" fill="var(--dry-color-bg-raised)" />
		<line
			x1="60"
			y1="41"
			x2="60"
			y2="46"
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
