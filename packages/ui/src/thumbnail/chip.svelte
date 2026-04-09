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
	<Svg viewBox="0 0 120 80" aria-label="chip thumbnail" width="100%" height="100%">
		<!-- Pill shape -->
		<rect
			x="22"
			y="31"
			width="76"
			height="18"
			rx="9"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Label line -->
		<rect x="32" y="38" width="38" height="3" rx="1.5" fill="var(--dry-color-text-weak)" />
		<!-- X dismiss circle -->
		<circle cx="84" cy="40" r="6" fill="var(--dry-color-text-weak)" opacity="0.25" />
		<!-- X lines -->
		<line
			x1="81.5"
			y1="37.5"
			x2="86.5"
			y2="42.5"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<line
			x1="86.5"
			y1="37.5"
			x2="81.5"
			y2="42.5"
			stroke="var(--dry-color-text-weak)"
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
