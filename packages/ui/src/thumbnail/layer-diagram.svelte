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
	<Svg viewBox="0 0 120 80" aria-label="LayerDiagram thumbnail" width="100%" height="100%">
		<rect x="8" y="8" width="104" height="64" rx="8" fill="var(--dry-color-fill-brand-weak)" stroke="var(--dry-color-stroke-brand)" stroke-width="1" />
		<rect x="18" y="18" width="84" height="44" rx="6" fill="var(--dry-color-fill-info-weak)" stroke="var(--dry-color-stroke-info)" stroke-width="1" />
		<rect x="28" y="28" width="64" height="24" rx="4" fill="var(--dry-color-fill-success-weak)" stroke="var(--dry-color-stroke-success)" stroke-width="1" />
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
