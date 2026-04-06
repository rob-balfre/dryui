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
	<Svg viewBox="0 0 120 80" aria-label="date-field thumbnail" width="100%" height="100%">
		<!-- Input rect -->
		<rect
			x="10"
			y="28"
			width="100"
			height="24"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- DD segment -->
		<rect
			x="17"
			y="35"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
		/>
		<rect
			x="19"
			y="38"
			width="10"
			height="4"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- slash -->
		<rect
			x="33"
			y="37"
			width="3"
			height="6"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
			transform="rotate(15 34.5 40)"
		/>
		<!-- MM segment -->
		<rect
			x="38"
			y="35"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<rect
			x="40"
			y="38"
			width="10"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- slash -->
		<rect
			x="54"
			y="37"
			width="3"
			height="6"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
			transform="rotate(15 55.5 40)"
		/>
		<!-- YYYY segment -->
		<rect
			x="59"
			y="35"
			width="22"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<rect
			x="61"
			y="38"
			width="18"
			height="4"
			rx="1"
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
