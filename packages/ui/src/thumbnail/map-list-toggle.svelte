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
	<Svg viewBox="0 0 120 80" aria-label="map list toggle thumbnail" width="100%" height="100%">
		<!-- Toggle container -->
		<rect
			x="20"
			y="28"
			width="80"
			height="24"
			rx="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Active map segment -->
		<rect
			x="21"
			y="29"
			width="38"
			height="22"
			rx="5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<!-- Map icon (active) -->
		<!-- Map shape: folded map -->
		<path
			d="M33 35 L39 33 L45 36 L45 45 L39 43 L33 45 Z"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linejoin="round"
		/>
		<line
			x1="39"
			y1="33"
			x2="39"
			y2="43"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
			stroke-dasharray="2,1"
		/>
		<rect
			x="28"
			y="35"
			width="20"
			height="4"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0"
		/>
		<!-- Map label -->
		<rect
			x="26"
			y="47"
			width="16"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.5"
		/>
		<!-- List icon (inactive) -->
		<line
			x1="66"
			y1="36"
			x2="80"
			y2="36"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<line
			x1="66"
			y1="40"
			x2="80"
			y2="40"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<line
			x1="66"
			y1="44"
			x2="76"
			y2="44"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<!-- List label -->
		<rect
			x="63"
			y="47"
			width="16"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Divider between segments -->
		<line x1="59" y1="32" x2="59" y2="48" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
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
