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
	<Svg viewBox="0 0 120 80" aria-label="link-preview thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Trigger link -->
		<rect
			x="8"
			y="8"
			width="40"
			height="6"
			rx="2"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
		/>
		<rect
			x="12"
			y="10"
			width="32"
			height="2.5"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- Floating preview card -->
		<rect
			x="12"
			y="20"
			width="96"
			height="52"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- OG image rect -->
		<rect
			x="18"
			y="26"
			width="36"
			height="24"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<!-- Image icon placeholder -->
		<rect
			x="26"
			y="33"
			width="20"
			height="3"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<polyline
			points="18,46 28,38 35,44 40,40 54,50"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			opacity="0.3"
		/>
		<!-- Title line -->
		<rect
			x="60"
			y="28"
			width="40"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.9"
		/>
		<!-- Description lines -->
		<rect
			x="60"
			y="36"
			width="42"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="60"
			y="43"
			width="34"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- URL line -->
		<rect
			x="18"
			y="56"
			width="50"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.5"
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
