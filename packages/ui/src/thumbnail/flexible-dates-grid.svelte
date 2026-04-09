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
	<Svg viewBox="0 0 120 80" aria-label="flexible dates grid thumbnail" width="100%" height="100%">
		<!-- Grid border -->
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Day headers -->
		<rect
			x="8"
			y="8"
			width="104"
			height="14"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.12"
		/>
		<line x1="8" y1="22" x2="112" y2="22" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<!-- 7 column lines -->
		<line x1="23" y1="8" x2="23" y2="72" stroke="var(--dry-color-stroke-weak)" stroke-width="0.5" />
		<line x1="38" y1="8" x2="38" y2="72" stroke="var(--dry-color-stroke-weak)" stroke-width="0.5" />
		<line x1="53" y1="8" x2="53" y2="72" stroke="var(--dry-color-stroke-weak)" stroke-width="0.5" />
		<line x1="68" y1="8" x2="68" y2="72" stroke="var(--dry-color-stroke-weak)" stroke-width="0.5" />
		<line x1="83" y1="8" x2="83" y2="72" stroke="var(--dry-color-stroke-weak)" stroke-width="0.5" />
		<line x1="98" y1="8" x2="98" y2="72" stroke="var(--dry-color-stroke-weak)" stroke-width="0.5" />
		<!-- Row divider -->
		<line
			x1="8"
			y1="46"
			x2="112"
			y2="46"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<!-- Row 1 prices -->
		<rect
			x="10"
			y="26"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="25"
			y="26"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="40"
			y="26"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Cheapest cell highlighted -->
		<rect x="53" y="22" width="15" height="24" fill="var(--dry-color-fill-brand)" opacity="0.12" />
		<rect
			x="55"
			y="26"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<rect
			x="55"
			y="32"
			width="9"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.5"
		/>
		<rect
			x="70"
			y="26"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="85"
			y="26"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Row 2 prices -->
		<rect
			x="10"
			y="50"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="25"
			y="50"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="40"
			y="50"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="55"
			y="50"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="70"
			y="50"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="85"
			y="50"
			width="11"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="100"
			y="50"
			width="10"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
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
