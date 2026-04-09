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
	<Svg viewBox="0 0 120 80" aria-label="color-picker thumbnail" width="100%" height="100%">
		<!-- Gradient saturation/lightness field (simplified as a rect) -->
		<defs>
			<linearGradient id="cp-h" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="white" />
				<stop offset="100%" stop-color="var(--dry-color-fill-brand)" />
			</linearGradient>
			<linearGradient id="cp-v" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="transparent" />
				<stop offset="100%" stop-color="black" />
			</linearGradient>
		</defs>
		<rect x="10" y="8" width="70" height="44" rx="4" fill="url(#cp-h)" />
		<rect x="10" y="8" width="70" height="44" rx="4" fill="url(#cp-v)" opacity="0.85" />
		<!-- Picker indicator -->
		<circle cx="55" cy="26" r="5" fill="none" stroke="white" stroke-width="2" />
		<!-- Hue slider track -->
		<rect
			x="10"
			y="57"
			width="70"
			height="8"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- Hue slider thumb -->
		<circle
			cx="42"
			cy="61"
			r="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Color swatch -->
		<rect
			x="88"
			y="8"
			width="22"
			height="22"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<!-- Hex input -->
		<rect
			x="88"
			y="36"
			width="22"
			height="10"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="90"
			y="39"
			width="14"
			height="4"
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
