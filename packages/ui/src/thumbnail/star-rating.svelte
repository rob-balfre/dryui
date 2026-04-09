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
	<Svg viewBox="0 0 120 80" aria-label="star rating thumbnail" width="100%" height="100%">
		<!-- 5 stars row centered -->
		<!-- Star 1 (filled) -->
		<path
			d="M16 44 L18 38 L20 44 L26 44 L21 48 L23 54 L18 50 L13 54 L15 48 L10 44 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.9"
		/>
		<!-- Star 2 (filled) -->
		<path
			d="M31 44 L33 38 L35 44 L41 44 L36 48 L38 54 L33 50 L28 54 L30 48 L25 44 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.9"
		/>
		<!-- Star 3 (filled) -->
		<path
			d="M46 44 L48 38 L50 44 L56 44 L51 48 L53 54 L48 50 L43 54 L45 48 L40 44 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.9"
		/>
		<!-- Star 4 (empty) -->
		<path
			d="M61 44 L63 38 L65 44 L71 44 L66 48 L68 54 L63 50 L58 54 L60 48 L55 44 Z"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			opacity="0.5"
		/>
		<!-- Star 5 (empty) -->
		<path
			d="M76 44 L78 38 L80 44 L86 44 L81 48 L83 54 L78 50 L73 54 L75 48 L70 44 Z"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			opacity="0.5"
		/>
		<!-- Rating text -->
		<rect
			x="90"
			y="40"
			width="22"
			height="6"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
		/>
		<rect
			x="92"
			y="42"
			width="18"
			height="2.5"
			rx="1.25"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Review count -->
		<rect
			x="90"
			y="50"
			width="22"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
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
