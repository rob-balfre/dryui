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
	<Svg viewBox="0 0 120 80" aria-label="phone-input thumbnail" width="100%" height="100%">
		<!-- Full input container -->
		<rect
			x="10"
			y="28"
			width="100"
			height="24"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Flag prefix -->
		<rect
			x="15"
			y="33"
			width="16"
			height="14"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<!-- Flag stripes -->
		<rect
			x="15"
			y="33"
			width="16"
			height="5"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.45"
		/>
		<!-- Chevron beside flag -->
		<polyline
			points="33,38 36,41 39,38"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			stroke-linecap="round"
			stroke-linejoin="round"
			opacity="0.6"
		/>
		<!-- Divider -->
		<line
			x1="42"
			y1="32"
			x2="42"
			y2="48"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.4"
		/>
		<!-- Phone number text -->
		<rect
			x="46"
			y="37"
			width="54"
			height="5"
			rx="2"
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
