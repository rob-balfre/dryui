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
	<Svg viewBox="0 0 120 80" aria-label="result card car thumbnail" width="100%" height="100%">
		<!-- Card -->
		<rect
			x="8"
			y="10"
			width="104"
			height="60"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Car icon -->
		<path
			d="M18 44 L18 36 L22 30 L38 30 L42 36 L42 44 Z"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linejoin="round"
		/>
		<path d="M22 30 L24 34 L38 34 L36 30" fill="var(--dry-color-text-weak)" opacity="0.2" />
		<circle
			cx="22"
			cy="44"
			r="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.2"
		/>
		<circle cx="22" cy="44" r="2" fill="var(--dry-color-bg-raised)" />
		<circle
			cx="38"
			cy="44"
			r="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.2"
		/>
		<circle cx="38" cy="44" r="2" fill="var(--dry-color-bg-raised)" />
		<!-- Details -->
		<rect
			x="52"
			y="22"
			width="40"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="52"
			y="31"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="52"
			y="38"
			width="32"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="52"
			y="45"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<!-- Price -->
		<rect
			x="82"
			y="52"
			width="24"
			height="8"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="85"
			y="54.5"
			width="18"
			height="3"
			rx="1.5"
			fill="var(--dry-color-bg-raised)"
			opacity="0.8"
		/>
		<!-- Per day label -->
		<rect
			x="80"
			y="44"
			width="26"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
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
