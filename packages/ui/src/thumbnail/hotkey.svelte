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
	<Svg viewBox="0 0 120 80" aria-label="hotkey thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Key cap left (⌘) -->
		<rect
			x="16"
			y="22"
			width="34"
			height="36"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="2"
		/>
		<!-- Bottom shadow for 3D key effect -->
		<rect
			x="16"
			y="52"
			width="34"
			height="6"
			rx="4"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.5"
		/>
		<!-- ⌘ symbol -->
		<text
			x="33"
			y="46"
			text-anchor="middle"
			font-size="16"
			font-family="system-ui, sans-serif"
			fill="var(--dry-color-text-weak)"
			opacity="0.85">⌘</text
		>
		<!-- Key cap right (K) -->
		<rect
			x="70"
			y="22"
			width="34"
			height="36"
			rx="6"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
		/>
		<!-- Bottom shadow -->
		<rect
			x="70"
			y="52"
			width="34"
			height="6"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.3"
		/>
		<!-- K letter -->
		<text
			x="87"
			y="46"
			text-anchor="middle"
			font-size="16"
			font-weight="600"
			font-family="system-ui, sans-serif"
			fill="var(--dry-color-fill-brand)"
			opacity="0.9">K</text
		>
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
