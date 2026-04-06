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
	<Svg viewBox="0 0 120 80" aria-label="heading thumbnail" width="100%" height="100%">
		<!-- H1 large bar -->
		<rect
			x="10"
			y="18"
			width="80"
			height="10"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.85"
		/>
		<!-- H2 medium bar -->
		<rect
			x="10"
			y="34"
			width="58"
			height="7"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.55"
		/>
		<!-- H3 smaller bar -->
		<rect
			x="10"
			y="47"
			width="44"
			height="6"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.38"
		/>
		<!-- Body text lines -->
		<rect
			x="10"
			y="59"
			width="90"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<rect
			x="10"
			y="67"
			width="70"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
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
