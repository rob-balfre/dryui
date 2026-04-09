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
	<Svg viewBox="0 0 120 80" aria-label="toggle-group thumbnail" width="100%" height="100%">
		<!-- Outer border -->
		<rect
			x="10"
			y="28"
			width="100"
			height="24"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Dividers -->
		<line
			x1="43"
			y1="28"
			x2="43"
			y2="52"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<line
			x1="77"
			y1="28"
			x2="77"
			y2="52"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Active segment (middle) -->
		<rect x="43" y="28" width="34" height="24" fill="var(--dry-color-fill-brand)" opacity="0.15" />
		<!-- Label lines -->
		<rect x="17" y="38" width="18" height="3" rx="1.5" fill="var(--dry-color-text-weak)" />
		<rect x="51" y="38" width="18" height="3" rx="1.5" fill="var(--dry-color-fill-brand)" />
		<rect x="85" y="38" width="18" height="3" rx="1.5" fill="var(--dry-color-text-weak)" />
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
