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
	<Svg viewBox="0 0 120 80" aria-label="hover-card thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Trigger element (link-style rect) -->
		<rect
			x="8"
			y="34"
			width="36"
			height="8"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
		/>
		<rect
			x="13"
			y="37"
			width="26"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<!-- Hover card floating panel -->
		<rect
			x="46"
			y="18"
			width="66"
			height="44"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Avatar circle -->
		<circle cx="59" cy="32" r="8" fill="var(--dry-color-text-weak)" opacity="0.3" />
		<!-- Name line -->
		<rect
			x="72"
			y="26"
			width="32"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.9"
		/>
		<!-- Handle line -->
		<rect
			x="72"
			y="34"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<!-- Bio lines -->
		<rect
			x="53"
			y="46"
			width="52"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="53"
			y="52"
			width="40"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
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
