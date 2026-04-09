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
	<Svg viewBox="0 0 120 80" aria-label="markdown-renderer thumbnail" width="100%" height="100%">
		<!-- H1 heading (bold wide bar) -->
		<rect
			x="10"
			y="8"
			width="68"
			height="7"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.8"
		/>
		<!-- Paragraph lines -->
		<rect
			x="10"
			y="22"
			width="96"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="10"
			y="30"
			width="80"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Bullet list items -->
		<circle cx="16" cy="42" r="2.5" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<rect
			x="22"
			y="39"
			width="64"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<circle cx="16" cy="52" r="2.5" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<rect
			x="22"
			y="49"
			width="50"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.38"
		/>
		<!-- Code inline hint -->
		<rect
			x="10"
			y="62"
			width="36"
			height="8"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="14"
			y="65"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
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
