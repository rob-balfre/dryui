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
	<Svg viewBox="0 0 120 80" aria-label="NodeGraph thumbnail" width="100%" height="100%">
		<line x1="30" y1="20" x2="60" y2="40" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<line x1="30" y1="60" x2="60" y2="40" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<line x1="60" y1="40" x2="90" y2="20" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<line x1="60" y1="40" x2="90" y2="60" stroke="var(--dry-color-stroke-strong)" stroke-width="1" />
		<rect x="16" y="10" width="28" height="18" rx="4" fill="var(--dry-color-bg-raised)" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<rect x="16" y="52" width="28" height="18" rx="4" fill="var(--dry-color-bg-raised)" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<rect x="46" y="30" width="28" height="18" rx="4" fill="var(--dry-color-fill-brand-weak)" stroke="var(--dry-color-stroke-brand)" stroke-width="1" />
		<rect x="76" y="10" width="28" height="18" rx="4" fill="var(--dry-color-fill-success-weak)" stroke="var(--dry-color-stroke-success)" stroke-width="1" />
		<rect x="76" y="52" width="28" height="18" rx="4" fill="var(--dry-color-fill-success-weak)" stroke="var(--dry-color-stroke-success)" stroke-width="1" />
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
