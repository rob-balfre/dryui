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
	<Svg
		viewBox="0 0 120 80"
		aria-label="loyalty points display thumbnail"
		width="100%"
		height="100%"
	>
		<!-- Card -->
		<rect
			x="10"
			y="8"
			width="100"
			height="64"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Large number rect -->
		<rect
			x="26"
			y="16"
			width="68"
			height="16"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect
			x="30"
			y="19"
			width="44"
			height="10"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.5"
		/>
		<!-- "pts" label -->
		<rect
			x="78"
			y="21"
			width="12"
			height="6"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.3"
		/>
		<!-- Progress bar track -->
		<rect
			x="20"
			y="42"
			width="80"
			height="8"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Progress fill -->
		<rect
			x="20"
			y="42"
			width="52"
			height="8"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>
		<!-- Labels -->
		<rect
			x="20"
			y="55"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="86"
			y="55"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Tier label -->
		<rect
			x="36"
			y="62"
			width="48"
			height="5"
			rx="2.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
		/>
		<rect
			x="44"
			y="63.5"
			width="32"
			height="2"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.5"
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
