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
	<Svg viewBox="0 0 120 80" aria-label="alert-dialog thumbnail" width="100%" height="100%">
		<!-- Dimmed backdrop -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-stroke-weak)" opacity="0.3" />
		<!-- Dialog card -->
		<rect
			x="20"
			y="14"
			width="80"
			height="52"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Warning circle icon -->
		<circle cx="60" cy="30" r="8" fill="var(--dry-color-fill-brand)" opacity="0.15" />
		<circle cx="60" cy="28" r="1.5" fill="var(--dry-color-fill-brand)" />
		<rect x="58.5" y="31" width="3" height="4" rx="1" fill="var(--dry-color-fill-brand)" />
		<!-- Title line -->
		<rect
			x="34"
			y="42"
			width="52"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.9"
		/>
		<!-- Body text line -->
		<rect
			x="38"
			y="50"
			width="44"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<!-- Cancel button -->
		<rect
			x="26"
			y="57"
			width="28"
			height="7"
			rx="3"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Confirm button -->
		<rect
			x="66"
			y="57"
			width="28"
			height="7"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.85"
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
