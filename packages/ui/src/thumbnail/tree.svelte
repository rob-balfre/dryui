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
	<Svg viewBox="0 0 120 80" aria-label="tree thumbnail" width="100%" height="100%">
		<!-- Root node -->
		<rect
			x="8"
			y="8"
			width="36"
			height="12"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="12"
			y="12"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>

		<!-- Connector lines -->
		<line
			x1="26"
			y1="20"
			x2="26"
			y2="28"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="26"
			y1="28"
			x2="52"
			y2="28"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="26"
			y1="28"
			x2="26"
			y2="50"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="26"
			y1="50"
			x2="52"
			y2="50"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="26"
			y1="50"
			x2="26"
			y2="66"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="26"
			y1="66"
			x2="52"
			y2="66"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>

		<!-- Child node 1 (expanded) -->
		<rect
			x="52"
			y="22"
			width="32"
			height="12"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
		/>
		<rect
			x="56"
			y="26"
			width="20"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>

		<!-- Grandchild connector -->
		<line
			x1="68"
			y1="34"
			x2="68"
			y2="40"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.5"
		/>
		<line
			x1="68"
			y1="40"
			x2="88"
			y2="40"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.5"
		/>
		<rect
			x="88"
			y="34"
			width="26"
			height="12"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="92"
			y="38"
			width="16"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>

		<!-- Child node 2 -->
		<rect
			x="52"
			y="44"
			width="32"
			height="12"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="56"
			y="48"
			width="18"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>

		<!-- Child node 3 -->
		<rect
			x="52"
			y="60"
			width="32"
			height="12"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="56"
			y="64"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.55"
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
