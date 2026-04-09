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
	<Svg viewBox="0 0 120 80" aria-label="flight timeline thumbnail" width="100%" height="100%">
		<!-- Card background -->
		<rect
			x="8"
			y="14"
			width="104"
			height="52"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Departure time -->
		<rect
			x="16"
			y="22"
			width="18"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<rect
			x="16"
			y="30"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Arrival time -->
		<rect
			x="86"
			y="22"
			width="18"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<rect
			x="86"
			y="30"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Timeline line -->
		<line
			x1="38"
			y1="26"
			x2="82"
			y2="26"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Departure dot -->
		<circle
			cx="38"
			cy="26"
			r="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
		/>
		<!-- Arrival dot -->
		<circle
			cx="82"
			cy="26"
			r="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
		/>
		<!-- Plane icon (center) -->
		<path
			d="M54 22 L60 26 L54 30 L55 27 L49 26 L55 25 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<path d="M57 21 L60 23 L57 24" fill="var(--dry-color-fill-brand)" opacity="0.5" />
		<path d="M57 28 L60 29 L57 31" fill="var(--dry-color-fill-brand)" opacity="0.5" />
		<!-- Duration text -->
		<rect
			x="66"
			y="20"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Detail lines -->
		<rect
			x="16"
			y="46"
			width="88"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<rect
			x="16"
			y="53"
			width="60"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
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
