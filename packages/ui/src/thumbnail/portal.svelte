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
	<Svg viewBox="0 0 120 80" aria-label="portal thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Source rect (origin) -->
		<rect
			x="8"
			y="26"
			width="36"
			height="28"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.12"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="14"
			y="35"
			width="22"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="14"
			y="42"
			width="16"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Destination rect (target, slightly highlighted) -->
		<rect
			x="76"
			y="26"
			width="36"
			height="28"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.1"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<rect
			x="82"
			y="35"
			width="22"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.5"
		/>
		<rect
			x="82"
			y="42"
			width="16"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.35"
		/>
		<!-- Curved arrow from source to destination -->
		<path
			d="M48,40 C54,20 66,20 72,40"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.8"
			stroke-linecap="round"
			opacity="0.7"
		/>
		<!-- Arrowhead at destination end -->
		<polygon points="72,40 67,36 68,42" fill="var(--dry-color-fill-brand)" opacity="0.7" />
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
