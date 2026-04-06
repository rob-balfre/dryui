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
	<Svg viewBox="0 0 120 80" aria-label="location autocomplete thumbnail" width="100%" height="100%">
		<!-- Input field -->
		<rect
			x="10"
			y="8"
			width="100"
			height="20"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<!-- Pin icon -->
		<circle
			cx="22"
			cy="17"
			r="4"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<circle cx="22" cy="17" r="1.5" fill="var(--dry-color-fill-brand)" />
		<path
			d="M22 21 L22 24"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<!-- Input text bar -->
		<rect
			x="32"
			y="14"
			width="40"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Cursor blink -->
		<line
			x1="74"
			y1="13"
			x2="74"
			y2="21"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>

		<!-- Dropdown -->
		<rect
			x="10"
			y="30"
			width="100"
			height="44"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Item 1 (highlighted) -->
		<rect
			x="10"
			y="30"
			width="100"
			height="14"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.08"
		/>
		<circle
			cx="22"
			cy="37"
			r="3"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
		/>
		<path
			d="M22 40 L22 42"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
			stroke-linecap="round"
		/>
		<rect
			x="30"
			y="33"
			width="44"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>
		<rect
			x="30"
			y="38"
			width="28"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Item 2 -->
		<line
			x1="14"
			y1="44"
			x2="106"
			y2="44"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<circle
			cx="22"
			cy="51"
			r="3"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
		/>
		<path
			d="M22 54 L22 56"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			stroke-linecap="round"
		/>
		<rect
			x="30"
			y="47"
			width="38"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="30"
			y="52"
			width="24"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Item 3 -->
		<line
			x1="14"
			y1="58"
			x2="106"
			y2="58"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="0.5"
		/>
		<circle
			cx="22"
			cy="65"
			r="3"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
		/>
		<rect
			x="30"
			y="61"
			width="42"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="30"
			y="66"
			width="26"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
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
