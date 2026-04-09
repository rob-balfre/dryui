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
	<Svg viewBox="0 0 120 80" aria-label="notification-center thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Bell icon body -->
		<path
			d="M18,12 Q18,7 24,7 Q30,7 30,12 L31,22 Q34,24 34,27 L14,27 Q14,24 17,22 Z"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Bell bottom clapper -->
		<path
			d="M21,27 Q21,30 24,30 Q27,30 27,27"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			opacity="0.5"
		/>
		<!-- Badge dot -->
		<circle cx="31" cy="8" r="4" fill="var(--dry-color-fill-brand)" />
		<!-- Floating panel -->
		<rect
			x="38"
			y="6"
			width="74"
			height="68"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Panel title -->
		<rect
			x="46"
			y="13"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.9"
		/>
		<!-- Notification items -->
		<rect
			x="44"
			y="22"
			width="62"
			height="13"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.1"
		/>
		<circle cx="51" cy="28" r="4" fill="var(--dry-color-text-weak)" opacity="0.3" />
		<rect
			x="58"
			y="25"
			width="34"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.75"
		/>
		<rect
			x="58"
			y="31"
			width="24"
			height="2.5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>

		<rect x="44" y="39" width="62" height="13" rx="3" fill="var(--dry-color-bg-raised)" />
		<circle cx="51" cy="45" r="4" fill="var(--dry-color-text-weak)" opacity="0.3" />
		<rect
			x="58"
			y="42"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="58"
			y="48"
			width="20"
			height="2.5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>

		<rect x="44" y="56" width="62" height="13" rx="3" fill="var(--dry-color-bg-raised)" />
		<circle cx="51" cy="62" r="4" fill="var(--dry-color-text-weak)" opacity="0.3" />
		<rect
			x="58"
			y="59"
			width="32"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="58"
			y="65"
			width="22"
			height="2.5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
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
