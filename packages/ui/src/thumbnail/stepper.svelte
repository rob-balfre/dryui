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
	<Svg viewBox="0 0 120 80" aria-label="stepper thumbnail" width="100%" height="100%">
		<!-- Connecting lines -->
		<line x1="26" y1="40" x2="46" y2="40" stroke="var(--dry-color-fill-brand)" stroke-width="2" />
		<line x1="66" y1="40" x2="86" y2="40" stroke="var(--dry-color-stroke-weak)" stroke-width="2" />
		<!-- Step 1 (completed) -->
		<circle cx="18" cy="40" r="8" fill="var(--dry-color-fill-brand)" />
		<!-- Step 2 (active) -->
		<circle
			cx="56"
			cy="40"
			r="8"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
		/>
		<circle cx="56" cy="40" r="4" fill="var(--dry-color-fill-brand)" />
		<!-- Step 3 (inactive) -->
		<circle
			cx="94"
			cy="40"
			r="8"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="2"
		/>
		<!-- Labels -->
		<rect
			x="10"
			y="52"
			width="16"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="48"
			y="52"
			width="16"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="86"
			y="52"
			width="16"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
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
