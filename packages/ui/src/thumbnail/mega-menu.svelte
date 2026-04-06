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
	<Svg viewBox="0 0 120 80" aria-label="mega-menu thumbnail" width="100%" height="100%">
		<!-- Top nav bar -->
		<rect
			x="0"
			y="6"
			width="120"
			height="18"
			rx="0"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Nav items in bar -->
		<rect
			x="8"
			y="11"
			width="16"
			height="8"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="28"
			y="11"
			width="16"
			height="8"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="48"
			y="11"
			width="16"
			height="8"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Dropdown panel -->
		<rect
			x="10"
			y="26"
			width="100"
			height="46"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Column 1 items -->
		<rect
			x="16"
			y="32"
			width="24"
			height="6"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="16"
			y="41"
			width="20"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="16"
			y="49"
			width="22"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="16"
			y="57"
			width="18"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Column 2 items -->
		<rect
			x="52"
			y="32"
			width="24"
			height="6"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="52"
			y="41"
			width="20"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="52"
			y="49"
			width="22"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Column 3 items -->
		<rect
			x="86"
			y="32"
			width="18"
			height="6"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="86"
			y="41"
			width="16"
			height="5"
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
