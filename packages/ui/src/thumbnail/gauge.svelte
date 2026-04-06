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
	<Svg viewBox="0 0 120 80" aria-label="gauge thumbnail" width="100%" height="100%">
		<!-- Background arc -->
		<path
			d="M18,62 A42,42 0 0,1 102,62"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="8"
			stroke-linecap="round"
		/>
		<!-- Filled arc (~65%) -->
		<path
			d="M18,62 A42,42 0 0,1 84,26"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="8"
			stroke-linecap="round"
			opacity="0.85"
		/>
		<!-- Center point -->
		<circle cx="60" cy="62" r="4" fill="var(--dry-color-text-weak)" opacity="0.6" />
		<!-- Needle -->
		<line
			x1="60"
			y1="62"
			x2="82"
			y2="29"
			stroke="var(--dry-color-text-weak)"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<!-- Center cap -->
		<circle
			cx="60"
			cy="62"
			r="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Value text -->
		<text
			x="60"
			y="75"
			text-anchor="middle"
			font-size="10"
			font-weight="600"
			fill="var(--dry-color-text-weak)"
			font-family="sans-serif">65%</text
		>
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
