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
	<Svg viewBox="0 0 120 80" aria-label="badge thumbnail" width="100%" height="100%">
		<!-- Primary badge -->
		<rect
			x="28"
			y="28"
			width="44"
			height="16"
			rx="8"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
		/>
		<rect
			x="28"
			y="28"
			width="44"
			height="16"
			rx="8"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<text
			x="50"
			y="40"
			text-anchor="middle"
			font-size="9"
			font-weight="600"
			fill="var(--dry-color-fill-brand)"
			font-family="sans-serif">New</text
		>

		<!-- Secondary badge -->
		<rect
			x="78"
			y="30"
			width="36"
			height="12"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<rect
			x="78"
			y="30"
			width="36"
			height="12"
			rx="6"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
		/>
		<text
			x="96"
			y="40"
			text-anchor="middle"
			font-size="8"
			fill="var(--dry-color-text-weak)"
			font-family="sans-serif">Draft</text
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
