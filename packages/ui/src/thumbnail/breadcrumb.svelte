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
	<Svg viewBox="0 0 120 80" aria-label="breadcrumb thumbnail" width="100%" height="100%">
		<!-- Breadcrumb item 1 -->
		<rect
			x="8"
			y="35"
			width="20"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Chevron 1 -->
		<text x="32" y="43" font-size="9" font-family="sans-serif" fill="var(--dry-color-text-weak)"
			>›</text
		>
		<!-- Breadcrumb item 2 -->
		<rect
			x="40"
			y="35"
			width="22"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Chevron 2 -->
		<text x="66" y="43" font-size="9" font-family="sans-serif" fill="var(--dry-color-text-weak)"
			>›</text
		>
		<!-- Breadcrumb item 3 (active) -->
		<rect
			x="74"
			y="35"
			width="24"
			height="10"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
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
