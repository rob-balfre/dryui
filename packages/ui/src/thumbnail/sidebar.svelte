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
	<Svg viewBox="0 0 120 80" aria-label="sidebar thumbnail" width="100%" height="100%">
		<!-- Sidebar panel -->
		<rect
			x="6"
			y="6"
			width="38"
			height="68"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Nav item 1 (active) -->
		<circle cx="18" cy="22" r="4" fill="var(--dry-color-fill-brand)" />
		<rect
			x="26"
			y="19"
			width="14"
			height="6"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- Nav item 2 -->
		<circle cx="18" cy="36" r="4" fill="var(--dry-color-text-weak)" opacity="0.4" />
		<rect
			x="26"
			y="33"
			width="12"
			height="6"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Nav item 3 -->
		<circle cx="18" cy="50" r="4" fill="var(--dry-color-text-weak)" opacity="0.4" />
		<rect
			x="26"
			y="47"
			width="14"
			height="6"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Nav item 4 -->
		<circle cx="18" cy="64" r="4" fill="var(--dry-color-text-weak)" opacity="0.4" />
		<rect
			x="26"
			y="61"
			width="10"
			height="6"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Main content area hint -->
		<rect
			x="50"
			y="6"
			width="64"
			height="68"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			opacity="0.4"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
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
