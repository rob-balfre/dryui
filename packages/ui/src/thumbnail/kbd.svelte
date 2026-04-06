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
	<Svg viewBox="0 0 120 80" aria-label="kbd thumbnail" width="100%" height="100%">
		<!-- Key 1: Ctrl -->
		<rect
			x="8"
			y="26"
			width="28"
			height="28"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="8"
			y="48"
			width="28"
			height="6"
			rx="0 0 4 4"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<text
			x="22"
			y="43"
			text-anchor="middle"
			font-size="8"
			font-weight="600"
			fill="var(--dry-color-text-weak)"
			font-family="sans-serif">Ctrl</text
		>

		<!-- Plus sign -->
		<text
			x="46"
			y="43"
			text-anchor="middle"
			font-size="12"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
			font-family="sans-serif">+</text
		>

		<!-- Key 2: K -->
		<rect
			x="54"
			y="26"
			width="28"
			height="28"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<rect
			x="54"
			y="48"
			width="28"
			height="6"
			rx="0 0 4 4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
		/>
		<text
			x="68"
			y="43"
			text-anchor="middle"
			font-size="13"
			font-weight="700"
			fill="var(--dry-color-fill-brand)"
			font-family="sans-serif">K</text
		>
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
