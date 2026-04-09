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
	<Svg viewBox="0 0 120 80" aria-label="filter sidebar thumbnail" width="100%" height="100%">
		<!-- Panel -->
		<rect
			x="8"
			y="6"
			width="48"
			height="68"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Section header 1 -->
		<rect
			x="12"
			y="12"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Checkbox items -->
		<rect
			x="12"
			y="20"
			width="6"
			height="6"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<path
			d="M13.5 23 L15 24.5 L17.5 21.5"
			stroke="var(--dry-color-bg-raised)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="22"
			y="21"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>

		<rect
			x="12"
			y="30"
			width="6"
			height="6"
			rx="1.5"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="22"
			y="31"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>

		<rect
			x="12"
			y="40"
			width="6"
			height="6"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<path
			d="M13.5 43 L15 44.5 L17.5 41.5"
			stroke="var(--dry-color-bg-raised)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="22"
			y="41"
			width="22"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>

		<!-- Section header 2 -->
		<rect
			x="12"
			y="52"
			width="22"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Slider track -->
		<rect
			x="12"
			y="60"
			width="36"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<rect
			x="12"
			y="60"
			width="20"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<circle cx="32" cy="61.5" r="4" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<circle cx="32" cy="61.5" r="2" fill="var(--dry-color-bg-raised)" />

		<!-- Main content area placeholder -->
		<rect
			x="62"
			y="6"
			width="50"
			height="68"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.05"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			stroke-dasharray="3,2"
		/>
		<rect
			x="68"
			y="14"
			width="38"
			height="18"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<rect
			x="68"
			y="36"
			width="38"
			height="18"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
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
