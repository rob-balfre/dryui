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
	<Svg viewBox="0 0 120 80" aria-label="file-select thumbnail" width="100%" height="100%">
		<!-- Container rect -->
		<rect
			x="10"
			y="24"
			width="100"
			height="32"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Folder icon -->
		<path
			d="M18 34 L18 30 L24 30 L26 28 L34 28 L34 30 L34 34 L34 44 L18 44 Z"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linejoin="round"
		/>
		<!-- Path text placeholder -->
		<rect
			x="40"
			y="37"
			width="40"
			height="5"
			rx="2"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.6"
		/>
		<!-- Clear X -->
		<line
			x1="96"
			y1="36"
			x2="102"
			y2="44"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<line
			x1="102"
			y1="36"
			x2="96"
			y2="44"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
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
