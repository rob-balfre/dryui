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
	<Svg viewBox="0 0 120 80" aria-label="tag thumbnail" width="100%" height="100%">
		<!-- Tag 1 -->
		<rect
			x="8"
			y="28"
			width="46"
			height="16"
			rx="8"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect
			x="8"
			y="28"
			width="46"
			height="16"
			rx="8"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<text
			x="14"
			y="40"
			font-size="9"
			font-weight="600"
			fill="var(--dry-color-fill-brand)"
			font-family="sans-serif">#svelte</text
		>

		<!-- Tag 2 -->
		<rect
			x="60"
			y="28"
			width="52"
			height="16"
			rx="8"
			fill="var(--dry-color-text-weak)"
			opacity="0.12"
		/>
		<rect
			x="60"
			y="28"
			width="52"
			height="16"
			rx="8"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			opacity="0.5"
		/>
		<text x="66" y="40" font-size="9" fill="var(--dry-color-text-weak)" font-family="sans-serif"
			>#design</text
		>
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
