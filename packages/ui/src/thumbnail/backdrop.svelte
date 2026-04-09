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
	<Svg viewBox="0 0 120 80" aria-label="backdrop thumbnail" width="100%" height="100%">
		<!-- Background page content (faint) -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<rect
			x="10"
			y="10"
			width="60"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="10"
			y="20"
			width="100"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<rect
			x="10"
			y="27"
			width="80"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<!-- Semi-transparent overlay -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-stroke-weak)" opacity="0.45" />
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
