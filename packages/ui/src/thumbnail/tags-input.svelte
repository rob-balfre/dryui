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
	<Svg viewBox="0 0 120 80" aria-label="tags-input thumbnail" width="100%" height="100%">
		<!-- Input rect -->
		<rect
			x="10"
			y="24"
			width="100"
			height="32"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Tag pill 1 -->
		<rect
			x="16"
			y="30"
			width="28"
			height="13"
			rx="6"
			fill="var(--dry-color-fill-brand)"
			opacity="0.18"
		/>
		<rect
			x="19"
			y="35"
			width="16"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.65"
		/>
		<line
			x1="40"
			y1="33"
			x2="42"
			y2="35"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.6"
		/>
		<line
			x1="42"
			y1="33"
			x2="40"
			y2="35"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.6"
		/>
		<!-- Tag pill 2 -->
		<rect
			x="47"
			y="30"
			width="32"
			height="13"
			rx="6"
			fill="var(--dry-color-fill-brand)"
			opacity="0.18"
		/>
		<rect
			x="50"
			y="35"
			width="20"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.65"
		/>
		<line
			x1="73"
			y1="33"
			x2="75"
			y2="35"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.6"
		/>
		<line
			x1="75"
			y1="33"
			x2="73"
			y2="35"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.6"
		/>
		<!-- Cursor -->
		<line
			x1="82"
			y1="31"
			x2="82"
			y2="43"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
			opacity="0.7"
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
