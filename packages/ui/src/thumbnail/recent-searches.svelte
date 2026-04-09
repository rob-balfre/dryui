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
	<Svg viewBox="0 0 120 80" aria-label="recent searches thumbnail" width="100%" height="100%">
		<!-- Panel -->
		<rect
			x="10"
			y="8"
			width="100"
			height="64"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Header -->
		<rect
			x="18"
			y="14"
			width="40"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<!-- Item 1 -->
		<line
			x1="10"
			y1="24"
			x2="110"
			y2="24"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<!-- Clock icon -->
		<circle
			cx="22"
			cy="32"
			r="6"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
		/>
		<line
			x1="22"
			y1="29"
			x2="22"
			y2="32"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			stroke-linecap="round"
		/>
		<line
			x1="22"
			y1="32"
			x2="25"
			y2="34"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			stroke-linecap="round"
		/>
		<rect
			x="32"
			y="28"
			width="52"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="32"
			y="34"
			width="36"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Item 2 -->
		<line
			x1="10"
			y1="44"
			x2="110"
			y2="44"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<circle
			cx="22"
			cy="52"
			r="6"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
		/>
		<line
			x1="22"
			y1="49"
			x2="22"
			y2="52"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			stroke-linecap="round"
		/>
		<line
			x1="22"
			y1="52"
			x2="25"
			y2="54"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			stroke-linecap="round"
		/>
		<rect
			x="32"
			y="48"
			width="44"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="32"
			y="54"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.28"
		/>
		<!-- Item 3 -->
		<line
			x1="10"
			y1="64"
			x2="110"
			y2="64"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<circle
			cx="22"
			cy="69"
			r="4"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			opacity="0.5"
		/>
		<rect
			x="32"
			y="66"
			width="48"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
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
