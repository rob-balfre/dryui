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
	<Svg viewBox="0 0 120 80" aria-label="slider thumbnail" width="100%" height="100%">
		<!-- Track background -->
		<rect
			x="12"
			y="37"
			width="96"
			height="6"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Filled track (progress) -->
		<rect
			x="12"
			y="37"
			width="56"
			height="6"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>
		<!-- Thumb handle -->
		<circle
			cx="68"
			cy="40"
			r="9"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
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
