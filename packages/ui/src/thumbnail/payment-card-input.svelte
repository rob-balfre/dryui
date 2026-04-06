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
	<Svg viewBox="0 0 120 80" aria-label="payment card input thumbnail" width="100%" height="100%">
		<!-- Card input field -->
		<rect
			x="8"
			y="20"
			width="104"
			height="24"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Credit card icon -->
		<rect
			x="14"
			y="25"
			width="16"
			height="12"
			rx="2"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
		/>
		<line x1="14" y1="29" x2="30" y2="29" stroke="var(--dry-color-text-weak)" stroke-width="2" />
		<rect
			x="15"
			y="32"
			width="5"
			height="2"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Segmented number groups -->
		<rect
			x="34"
			y="28"
			width="14"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="51"
			y="28"
			width="14"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="68"
			y="28"
			width="14"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Cursor + last group partial -->
		<rect
			x="85"
			y="28"
			width="8"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<line
			x1="95"
			y1="26"
			x2="95"
			y2="38"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<!-- Expiry + CVV row -->
		<rect
			x="8"
			y="50"
			width="46"
			height="16"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="14"
			y="55"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="62"
			y="50"
			width="50"
			height="16"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="68"
			y="55"
			width="18"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Card type icon -->
		<rect
			x="100"
			y="53"
			width="10"
			height="7"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.3"
		/>
		<circle cx="103" cy="56.5" r="3" fill="var(--dry-color-fill-brand)" opacity="0.4" />
		<circle cx="107" cy="56.5" r="3" fill="var(--dry-color-fill-brand)" opacity="0.6" />
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
