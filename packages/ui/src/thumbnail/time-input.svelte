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
	<Svg viewBox="0 0 120 80" aria-label="time-input thumbnail" width="100%" height="100%">
		<!-- Input rect -->
		<rect
			x="20"
			y="26"
			width="80"
			height="28"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- HH segment -->
		<rect
			x="26"
			y="32"
			width="20"
			height="16"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect
			x="28"
			y="37"
			width="16"
			height="6"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.65"
		/>
		<!-- Colon dots -->
		<circle cx="52" cy="37" r="2" fill="var(--dry-color-stroke-weak)" opacity="0.7" />
		<circle cx="52" cy="43" r="2" fill="var(--dry-color-stroke-weak)" opacity="0.7" />
		<!-- MM segment -->
		<rect
			x="58"
			y="32"
			width="20"
			height="16"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<rect
			x="60"
			y="37"
			width="16"
			height="6"
			rx="2"
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
