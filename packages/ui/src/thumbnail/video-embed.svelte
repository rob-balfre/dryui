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
	<Svg viewBox="0 0 120 80" aria-label="video-embed thumbnail" width="100%" height="100%">
		<!-- Video frame -->
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Play button circle -->
		<circle
			cx="60"
			cy="40"
			r="18"
			fill="var(--dry-color-bg-raised)"
			opacity="0.9"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Play triangle -->
		<polygon points="55,32 55,48 71,40" fill="var(--dry-color-fill-brand)" opacity="0.85" />
		<!-- Progress bar at bottom -->
		<rect
			x="16"
			y="64"
			width="88"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<rect
			x="16"
			y="64"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- Playhead dot -->
		<circle cx="52" cy="66" r="3.5" fill="var(--dry-color-fill-brand)" />
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
