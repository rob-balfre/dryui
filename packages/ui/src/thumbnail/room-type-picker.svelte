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
	<Svg viewBox="0 0 120 80" aria-label="room type picker thumbnail" width="100%" height="100%">
		<!-- Room card 1 (selected) -->
		<rect
			x="10"
			y="8"
			width="100"
			height="18"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.1"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<!-- Room icon (bed) -->
		<path
			d="M16 21 L16 13 L28 13 L28 17 L16 17"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="16"
			y="17"
			width="12"
			height="4"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.2"
		/>
		<rect
			x="32"
			y="12"
			width="40"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<rect
			x="32"
			y="19"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.4"
		/>
		<rect
			x="88"
			y="13"
			width="18"
			height="5"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<!-- Radio check -->
		<circle cx="107" cy="17" r="4" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<circle cx="107" cy="17" r="1.5" fill="var(--dry-color-bg-raised)" />

		<!-- Room card 2 -->
		<rect
			x="10"
			y="30"
			width="100"
			height="18"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<path
			d="M16 43 L16 35 L22 35 L22 37 L28 37 L28 35 L34 35 L34 43"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="38"
			y="34"
			width="36"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="38"
			y="41"
			width="22"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="86"
			y="35"
			width="18"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<circle
			cx="107"
			cy="39"
			r="4"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>

		<!-- Room card 3 -->
		<rect
			x="10"
			y="52"
			width="100"
			height="18"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<path
			d="M16 65 L16 57 L28 57 L28 61 L22 61 L22 65"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="32"
			y="56"
			width="44"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="32"
			y="63"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="84"
			y="57"
			width="20"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<circle
			cx="107"
			cy="61"
			r="4"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
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
