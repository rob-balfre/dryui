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
	<Svg viewBox="0 0 120 80" aria-label="code-block thumbnail" width="100%" height="100%">
		<!-- Dark background -->
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.18"
		/>
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="6"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Top bar dots (window chrome) -->
		<circle cx="20" cy="18" r="3" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<circle cx="30" cy="18" r="3" fill="var(--dry-color-text-weak)" opacity="0.35" />
		<circle cx="40" cy="18" r="3" fill="var(--dry-color-text-weak)" opacity="0.25" />
		<!-- Code lines -->
		<!-- Line 1: keyword + identifier -->
		<rect
			x="16"
			y="28"
			width="16"
			height="4"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.9"
		/>
		<rect
			x="36"
			y="28"
			width="30"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Line 2: indented -->
		<rect
			x="22"
			y="36"
			width="12"
			height="4"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>
		<rect
			x="38"
			y="36"
			width="42"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Line 3: comment -->
		<rect
			x="22"
			y="44"
			width="56"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Line 4: closing -->
		<rect
			x="16"
			y="52"
			width="10"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
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
