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
	<Svg viewBox="0 0 120 80" aria-label="toast thumbnail" width="100%" height="100%">
		<!-- Toast card, positioned bottom-right -->
		<rect
			x="34"
			y="46"
			width="78"
			height="24"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Shadow hint -->
		<rect
			x="36"
			y="48"
			width="78"
			height="24"
			rx="5"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.2"
		/>
		<!-- Toast card (redrawn on top of shadow) -->
		<rect
			x="34"
			y="44"
			width="78"
			height="24"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Check icon circle -->
		<circle cx="48" cy="56" r="6" fill="var(--dry-color-fill-brand)" opacity="0.15" />
		<!-- Checkmark -->
		<polyline
			points="45,56 47.5,58.5 51.5,53.5"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<!-- Message line -->
		<rect
			x="60"
			y="52"
			width="42"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.8"
		/>
		<!-- Sub-line -->
		<rect
			x="60"
			y="59"
			width="28"
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
