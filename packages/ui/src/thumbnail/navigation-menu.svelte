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
	<Svg viewBox="0 0 120 80" aria-label="navigation-menu thumbnail" width="100%" height="100%">
		<!-- Panel background -->
		<rect
			x="10"
			y="8"
			width="100"
			height="64"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Active indicator bar -->
		<rect x="10" y="20" width="3" height="12" rx="1" fill="var(--dry-color-fill-brand)" />
		<!-- Active item -->
		<rect
			x="18"
			y="23"
			width="50"
			height="7"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect
			x="22"
			y="25"
			width="32"
			height="5"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- Other items -->
		<rect
			x="22"
			y="37"
			width="36"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="22"
			y="48"
			width="28"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="22"
			y="59"
			width="40"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
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
