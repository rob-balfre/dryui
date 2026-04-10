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
	<Svg viewBox="0 0 120 80" aria-label="CycleDiagram thumbnail" width="100%" height="100%">
		<rect x="42" y="4" width="28" height="16" rx="4" fill="var(--dry-color-bg-raised)" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<rect x="80" y="32" width="28" height="16" rx="4" fill="var(--dry-color-bg-raised)" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<rect x="42" y="60" width="28" height="16" rx="4" fill="var(--dry-color-bg-raised)" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<rect x="8" y="32" width="28" height="16" rx="4" fill="var(--dry-color-bg-raised)" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<path d="M 70 10 A 30 30 0 0 1 92 30" fill="none" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<path d="M 92 50 A 30 30 0 0 1 70 70" fill="none" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<path d="M 42 70 A 30 30 0 0 1 28 50" fill="none" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<path d="M 28 30 A 30 30 0 0 1 42 10" fill="none" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
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
