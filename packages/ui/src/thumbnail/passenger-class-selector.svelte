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
	<Svg
		viewBox="0 0 120 80"
		aria-label="passenger class selector thumbnail"
		width="100%"
		height="100%"
	>
		<!-- Dropdown trigger -->
		<rect
			x="16"
			y="24"
			width="88"
			height="32"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Person icon -->
		<circle
			cx="32"
			cy="34"
			r="5"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
		/>
		<path
			d="M24 48 Q24 42 32 42 Q40 42 40 48"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
		/>
		<!-- Count badge -->
		<circle
			cx="42"
			cy="30"
			r="5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
		/>
		<rect
			x="39"
			y="28"
			width="6"
			height="4"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>
		<!-- Class text bar -->
		<rect
			x="52"
			y="30"
			width="32"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="52"
			y="37"
			width="22"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Chevron -->
		<path
			d="M94 36 L99 41 L104 36"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<!-- Dropdown hint -->
		<rect
			x="16"
			y="58"
			width="88"
			height="16"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.7"
		/>
		<rect
			x="24"
			y="63"
			width="32"
			height="3"
			rx="1.5"
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
