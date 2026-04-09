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
	<Svg viewBox="0 0 120 80" aria-label="focus-trap thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Outer focus ring (dashed border) -->
		<rect
			x="10"
			y="10"
			width="100"
			height="60"
			rx="6"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-dasharray="4,3"
			opacity="0.6"
		/>
		<!-- Inner focus ring (double outline effect) -->
		<rect
			x="16"
			y="16"
			width="88"
			height="48"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.07"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
		/>
		<!-- Focused input field -->
		<rect
			x="24"
			y="24"
			width="72"
			height="11"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
		/>
		<rect
			x="30"
			y="27"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Secondary element (button) -->
		<rect
			x="24"
			y="42"
			width="30"
			height="10"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="66"
			y="42"
			width="30"
			height="10"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
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
