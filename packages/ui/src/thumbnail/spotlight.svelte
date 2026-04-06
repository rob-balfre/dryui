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
	<Svg viewBox="0 0 120 80" aria-label="spotlight thumbnail" width="100%" height="100%">
		<defs>
			<radialGradient id="spotlight-grad" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="var(--dry-color-bg-raised)" stop-opacity="1" />
				<stop offset="60%" stop-color="var(--dry-color-text-weak)" stop-opacity="0.05" />
				<stop offset="100%" stop-color="var(--dry-color-text-weak)" stop-opacity="0.6" />
			</radialGradient>
		</defs>
		<!-- Dark background -->
		<rect
			x="0"
			y="0"
			width="120"
			height="80"
			rx="0"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Spotlight overlay -->
		<circle cx="60" cy="40" r="28" fill="url(#spotlight-grad)" />
		<!-- Outer ring hint -->
		<circle
			cx="60"
			cy="40"
			r="28"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.4"
		/>
		<!-- Content in spotlight -->
		<rect
			x="36"
			y="34"
			width="48"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="42"
			y="43"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
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
