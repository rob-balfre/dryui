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
	<Svg viewBox="0 0 120 80" aria-label="progress thumbnail" width="100%" height="100%">
		<!-- Label line above -->
		<rect
			x="10"
			y="30"
			width="28"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Percentage hint right -->
		<rect
			x="96"
			y="30"
			width="16"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Track background -->
		<rect x="10" y="40" width="100" height="8" rx="4" fill="var(--dry-color-stroke-weak)" />
		<!-- Filled portion ~65% -->
		<rect x="10" y="40" width="65" height="8" rx="4" fill="var(--dry-color-fill-brand)" />
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
