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
	<Svg viewBox="0 0 120 80" aria-label="scroll-area thumbnail" width="100%" height="100%">
		<!-- Content area -->
		<rect
			x="8"
			y="8"
			width="96"
			height="64"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Content lines -->
		<line
			x1="16"
			y1="20"
			x2="96"
			y2="20"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
			opacity="0.6"
		/>
		<line
			x1="16"
			y1="30"
			x2="88"
			y2="30"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.4"
		/>
		<line
			x1="16"
			y1="40"
			x2="92"
			y2="40"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.4"
		/>
		<line
			x1="16"
			y1="50"
			x2="84"
			y2="50"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.4"
		/>
		<line
			x1="16"
			y1="60"
			x2="90"
			y2="60"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.4"
		/>
		<!-- Scrollbar track on right side -->
		<rect
			x="106"
			y="8"
			width="6"
			height="64"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<!-- Scrollbar thumb (active position ~top third) -->
		<rect
			x="107"
			y="12"
			width="4"
			height="22"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
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
