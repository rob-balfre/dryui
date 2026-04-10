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
	<Svg viewBox="0 0 120 80" aria-label="FlowDiagram thumbnail" width="100%" height="100%">
		<rect x="8" y="28" width="24" height="24" rx="4" fill="var(--dry-color-fill-brand-weak)" stroke="var(--dry-color-stroke-brand)" stroke-width="1" />
		<line x1="32" y1="40" x2="42" y2="40" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<polyline points="39,37 43,40 39,43" fill="none" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<rect x="44" y="28" width="24" height="24" rx="4" fill="var(--dry-color-bg-raised)" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<line x1="68" y1="40" x2="78" y2="40" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<polyline points="75,37 79,40 75,43" fill="none" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<rect x="80" y="28" width="24" height="24" rx="4" fill="var(--dry-color-bg-raised)" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
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
