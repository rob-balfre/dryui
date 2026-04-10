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
	<Svg viewBox="0 0 120 80" aria-label="ArchitectureDiagram thumbnail" width="100%" height="100%">
		<rect x="12" y="6" width="96" height="20" rx="4" fill="var(--dry-color-bg-raised)" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<line x1="60" y1="26" x2="60" y2="32" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<polyline points="57,30 60,34 63,30" fill="none" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<rect x="35" y="34" width="50" height="20" rx="6" fill="var(--dry-color-fill-brand)" stroke="none" />
		<line x1="60" y1="54" x2="60" y2="60" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<polyline points="57,58 60,62 63,58" fill="none" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<rect x="12" y="62" width="96" height="16" rx="4" fill="var(--dry-color-bg-raised)" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
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
