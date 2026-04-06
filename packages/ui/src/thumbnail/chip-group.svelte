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
	<Svg viewBox="0 0 120 80" aria-label="chip-group thumbnail" width="100%" height="100%">
		<!-- Chip 1 (active/primary) -->
		<rect
			x="8"
			y="31"
			width="32"
			height="18"
			rx="9"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<rect x="14" y="38" width="20" height="3" rx="1.5" fill="var(--dry-color-fill-brand)" />
		<!-- Chip 2 -->
		<rect
			x="44"
			y="31"
			width="32"
			height="18"
			rx="9"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect x="50" y="38" width="20" height="3" rx="1.5" fill="var(--dry-color-text-weak)" />
		<!-- Chip 3 -->
		<rect
			x="80"
			y="31"
			width="32"
			height="18"
			rx="9"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect x="86" y="38" width="20" height="3" rx="1.5" fill="var(--dry-color-text-weak)" />
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
