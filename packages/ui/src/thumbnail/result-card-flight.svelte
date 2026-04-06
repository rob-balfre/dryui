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
	<Svg viewBox="0 0 120 80" aria-label="result card flight thumbnail" width="100%" height="100%">
		<!-- Card -->
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Airline logo placeholder -->
		<rect
			x="16"
			y="16"
			width="16"
			height="16"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<!-- Route line -->
		<circle
			cx="16"
			cy="46"
			r="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
		/>
		<line
			x1="20"
			y1="46"
			x2="56"
			y2="46"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Plane icon -->
		<path
			d="M38 42 L44 46 L38 50 L39 47 L33 46 L39 45 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<line
			x1="56"
			y1="46"
			x2="88"
			y2="46"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<circle
			cx="88"
			cy="46"
			r="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
		/>
		<!-- Departure time -->
		<rect
			x="10"
			y="54"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Arrival time -->
		<rect
			x="80"
			y="54"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Duration -->
		<rect
			x="42"
			y="50"
			width="18"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Airline name -->
		<rect
			x="36"
			y="20"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="36"
			y="27"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Price -->
		<rect
			x="90"
			y="18"
			width="16"
			height="6"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="88"
			y="27"
			width="18"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
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
