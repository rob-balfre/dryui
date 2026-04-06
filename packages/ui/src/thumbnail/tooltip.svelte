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
	<Svg viewBox="0 0 120 80" aria-label="tooltip thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Trigger element (icon button) -->
		<circle
			cx="60"
			cy="62"
			r="10"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<circle cx="60" cy="59" r="1.5" fill="var(--dry-color-text-weak)" opacity="0.7" />
		<rect
			x="58.5"
			y="62"
			width="3"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Tooltip label -->
		<rect
			x="26"
			y="24"
			width="68"
			height="18"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.9"
		/>
		<rect
			x="34"
			y="30"
			width="52"
			height="3.5"
			rx="1.5"
			fill="var(--dry-color-bg-raised)"
			opacity="0.9"
		/>
		<!-- Arrow pointing down -->
		<polygon points="60,44 55,50 65,50" fill="var(--dry-color-text-weak)" opacity="0.9" />
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
