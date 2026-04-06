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
	<Svg viewBox="0 0 120 80" aria-label="combobox thumbnail" width="100%" height="100%">
		<!-- Input rect -->
		<rect
			x="10"
			y="8"
			width="100"
			height="20"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Placeholder text line -->
		<rect
			x="17"
			y="15"
			width="50"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Chevron down -->
		<polyline
			points="97,15 102,20 107,15"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<!-- Dropdown list -->
		<rect
			x="10"
			y="32"
			width="100"
			height="42"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Item 1 highlighted -->
		<rect
			x="12"
			y="34"
			width="96"
			height="12"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect
			x="18"
			y="38"
			width="40"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<!-- Item 2 -->
		<rect
			x="18"
			y="51"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Item 3 -->
		<rect
			x="18"
			y="63"
			width="44"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
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
