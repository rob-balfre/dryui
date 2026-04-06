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
	<Svg viewBox="0 0 120 80" aria-label="dropdown-menu thumbnail" width="100%" height="100%">
		<!-- Trigger button -->
		<rect
			x="30"
			y="6"
			width="60"
			height="14"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="38"
			y="11"
			width="28"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Chevron down -->
		<polyline
			points="79,11 82,14 85,11"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<!-- Dropdown list -->
		<rect
			x="30"
			y="24"
			width="60"
			height="52"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Highlighted item -->
		<rect
			x="32"
			y="26"
			width="56"
			height="10"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.12"
		/>
		<rect
			x="38"
			y="29"
			width="32"
			height="3.5"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.85"
		/>
		<!-- Other items -->
		<rect
			x="38"
			y="42"
			width="38"
			height="3.5"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="38"
			y="54"
			width="30"
			height="3.5"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="38"
			y="66"
			width="36"
			height="3.5"
			rx="1.5"
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
