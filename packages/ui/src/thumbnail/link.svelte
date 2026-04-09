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
	<Svg viewBox="0 0 120 80" aria-label="link thumbnail" width="100%" height="100%">
		<!-- Link text line -->
		<rect
			x="20"
			y="35"
			width="60"
			height="7"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.8"
		/>
		<!-- Underline -->
		<line x1="20" y1="44" x2="80" y2="44" stroke="var(--dry-color-fill-brand)" stroke-width="1.5" />
		<!-- Arrow right -->
		<line
			x1="83"
			y1="38.5"
			x2="94"
			y2="38.5"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<polyline
			points="90,35 94,38.5 90,42"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			stroke-linejoin="round"
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
