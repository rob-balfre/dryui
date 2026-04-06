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
	<Svg viewBox="0 0 120 80" aria-label="fieldset thumbnail" width="100%" height="100%">
		<!-- Fieldset border: top broken by legend -->
		<!-- Left top segment -->
		<line
			x1="10"
			y1="14"
			x2="10"
			y2="70"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<line
			x1="10"
			y1="70"
			x2="110"
			y2="70"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<line
			x1="110"
			y1="70"
			x2="110"
			y2="14"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<!-- top line left of legend -->
		<line
			x1="10"
			y1="14"
			x2="16"
			y2="14"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<!-- top line right of legend -->
		<line
			x1="46"
			y1="14"
			x2="110"
			y2="14"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<!-- Legend label -->
		<rect x="17" y="10" width="28" height="8" rx="2" fill="var(--dry-color-bg-raised)" />
		<rect
			x="18"
			y="12"
			width="24"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Inner input rects -->
		<rect
			x="20"
			y="26"
			width="80"
			height="14"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.2"
		/>
		<rect
			x="20"
			y="46"
			width="80"
			height="14"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.2"
		/>
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
