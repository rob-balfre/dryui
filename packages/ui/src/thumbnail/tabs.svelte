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
	<Svg viewBox="0 0 120 80" aria-label="tabs thumbnail" width="100%" height="100%">
		<!-- Tab labels row -->
		<rect
			x="8"
			y="20"
			width="26"
			height="16"
			rx="2"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Active tab -->
		<rect
			x="37"
			y="20"
			width="26"
			height="16"
			rx="2"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
		/>
		<!-- Active underline -->
		<rect x="37" y="34" width="26" height="2" rx="1" fill="var(--dry-color-fill-brand)" />
		<rect
			x="66"
			y="20"
			width="26"
			height="16"
			rx="2"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Tab item text rects -->
		<rect
			x="14"
			y="26"
			width="14"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="43"
			y="26"
			width="14"
			height="5"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="72"
			y="26"
			width="14"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Content area -->
		<rect
			x="8"
			y="40"
			width="104"
			height="30"
			rx="2"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="16"
			y="48"
			width="50"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="16"
			y="57"
			width="36"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
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
