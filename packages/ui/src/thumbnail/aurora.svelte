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
	<Svg viewBox="0 0 120 80" aria-label="aurora thumbnail" width="100%" height="100%">
		<defs>
			<clipPath id="aurora-clip">
				<rect x="0" y="0" width="120" height="80" />
			</clipPath>
		</defs>
		<!-- Background -->
		<rect x="0" y="0" width="120" height="80" rx="3" fill="var(--dry-color-bg-raised)" />
		<!-- Overlapping translucent blobs -->
		<ellipse
			cx="42"
			cy="42"
			rx="34"
			ry="28"
			fill="var(--dry-color-fill-brand)"
			opacity="0.18"
			clip-path="url(#aurora-clip)"
		/>
		<ellipse
			cx="72"
			cy="32"
			rx="30"
			ry="26"
			fill="var(--dry-color-text-weak)"
			opacity="0.22"
			clip-path="url(#aurora-clip)"
		/>
		<ellipse
			cx="80"
			cy="56"
			rx="28"
			ry="22"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.25"
			clip-path="url(#aurora-clip)"
		/>
		<!-- Subtle border -->
		<rect
			x="0"
			y="0"
			width="120"
			height="80"
			rx="3"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
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
