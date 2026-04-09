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
	<Svg viewBox="0 0 120 80" aria-label="button-group thumbnail" width="100%" height="100%">
		<!-- Outer border of combined group -->
		<rect
			x="15"
			y="28"
			width="90"
			height="24"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Divider lines between segments -->
		<line
			x1="45"
			y1="28"
			x2="45"
			y2="52"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="75"
			y1="28"
			x2="75"
			y2="52"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Middle button highlighted -->
		<rect x="45" y="28" width="30" height="24" fill="var(--dry-color-fill-brand)" opacity="0.15" />
		<!-- Label lines -->
		<rect x="23" y="38" width="14" height="3" rx="1.5" fill="var(--dry-color-text-weak)" />
		<rect x="53" y="38" width="14" height="3" rx="1.5" fill="var(--dry-color-fill-brand)" />
		<rect x="83" y="38" width="14" height="3" rx="1.5" fill="var(--dry-color-text-weak)" />
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
