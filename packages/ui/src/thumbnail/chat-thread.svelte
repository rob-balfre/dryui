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
	<Svg viewBox="0 0 120 80" aria-label="chat-thread thumbnail" width="100%" height="100%">
		<!-- Message 1 (left) -->
		<rect
			x="8"
			y="6"
			width="58"
			height="18"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="15"
			y="12"
			width="34"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="15"
			y="18"
			width="22"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>

		<!-- Message 2 (right) -->
		<rect
			x="54"
			y="31"
			width="58"
			height="18"
			rx="5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect
			x="54"
			y="31"
			width="58"
			height="18"
			rx="5"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<rect
			x="62"
			y="37"
			width="34"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>
		<rect
			x="62"
			y="43"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.4"
		/>

		<!-- Message 3 (left) -->
		<rect
			x="8"
			y="56"
			width="50"
			height="18"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="15"
			y="62"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="15"
			y="68"
			width="18"
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
