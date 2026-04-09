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
	<Svg viewBox="0 0 120 80" aria-label="toolbar thumbnail" width="100%" height="100%">
		<!-- Toolbar bar -->
		<rect
			x="6"
			y="28"
			width="108"
			height="24"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Icon button squares group 1 -->
		<rect
			x="12"
			y="33"
			width="14"
			height="14"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="29"
			y="33"
			width="14"
			height="14"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<rect
			x="46"
			y="33"
			width="14"
			height="14"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Vertical separator -->
		<line
			x1="66"
			y1="34"
			x2="66"
			y2="54"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Icon button squares group 2 -->
		<rect
			x="71"
			y="33"
			width="14"
			height="14"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<rect
			x="88"
			y="33"
			width="14"
			height="14"
			rx="2"
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
