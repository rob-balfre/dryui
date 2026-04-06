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
	<Svg viewBox="0 0 120 80" aria-label="route map thumbnail" width="100%" height="100%">
		<!-- Map background -->
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.08"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Map grid lines (faint) -->
		<line
			x1="8"
			y1="28"
			x2="112"
			y2="28"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.5"
		/>
		<line
			x1="8"
			y1="48"
			x2="112"
			y2="48"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.5"
		/>
		<line
			x1="38"
			y1="8"
			x2="38"
			y2="72"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.5"
		/>
		<line
			x1="78"
			y1="8"
			x2="78"
			y2="72"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
			opacity="0.5"
		/>
		<!-- Curved flight path -->
		<path
			d="M26 56 Q60 20 94 44"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
			fill="none"
			stroke-dasharray="4,3"
			stroke-linecap="round"
		/>
		<!-- Point A marker -->
		<circle cx="26" cy="56" r="6" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<circle cx="26" cy="56" r="2.5" fill="var(--dry-color-bg-raised)" />
		<!-- A label -->
		<rect
			x="30"
			y="60"
			width="8"
			height="5"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
		/>
		<!-- Point B marker -->
		<circle cx="94" cy="44" r="6" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<circle cx="94" cy="44" r="2.5" fill="var(--dry-color-bg-raised)" />
		<!-- B label -->
		<rect
			x="98"
			y="48"
			width="8"
			height="5"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
		/>
		<!-- Plane at midpoint -->
		<path
			d="M56 34 L62 38 L56 42 L57 39 L51 38 L57 37 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
	</Svg>
</span>

<style>
	[data-thumbnail] {
		display: inline-grid;
		width: var(--thumbnail-w);
		height: var(--thumbnail-h);
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
