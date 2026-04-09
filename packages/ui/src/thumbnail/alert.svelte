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
	<Svg viewBox="0 0 120 80" aria-label="alert thumbnail" width="100%" height="100%">
		<!-- Card background -->
		<rect
			x="8"
			y="22"
			width="104"
			height="36"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Left accent bar -->
		<rect x="8" y="22" width="4" height="36" rx="2" fill="var(--dry-color-fill-brand)" />
		<!-- Circle icon -->
		<circle cx="30" cy="40" r="8" fill="var(--dry-color-fill-brand)" opacity="0.15" />
		<circle cx="30" cy="37" r="1.5" fill="var(--dry-color-fill-brand)" />
		<rect x="28.5" y="40" width="3" height="5" rx="1" fill="var(--dry-color-fill-brand)" />
		<!-- Title line -->
		<rect
			x="46"
			y="33"
			width="44"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.9"
		/>
		<!-- Body line -->
		<rect
			x="46"
			y="41"
			width="56"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
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
