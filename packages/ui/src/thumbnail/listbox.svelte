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
	<Svg viewBox="0 0 120 80" aria-label="listbox thumbnail" width="100%" height="100%">
		<!-- List container -->
		<rect
			x="15"
			y="8"
			width="90"
			height="64"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Item 1 (highlighted) -->
		<rect
			x="17"
			y="10"
			width="86"
			height="14"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect
			x="22"
			y="15"
			width="42"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- Item 2 -->
		<rect
			x="22"
			y="30"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Item 3 -->
		<rect
			x="22"
			y="44"
			width="48"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Item 4 -->
		<rect
			x="22"
			y="58"
			width="30"
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
