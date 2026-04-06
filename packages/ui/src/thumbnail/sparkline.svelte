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
	<Svg viewBox="0 0 120 80" aria-label="sparkline thumbnail" width="100%" height="100%">
		<!-- Sparkline area fill -->
		<path
			d="M10,58 L22,44 L34,50 L46,32 L58,38 L70,24 L82,30 L94,18 L106,22 L106,68 L10,68 Z"
			fill="var(--dry-color-fill-brand)"
			opacity="0.12"
		/>
		<!-- Sparkline stroke -->
		<polyline
			points="10,58 22,44 34,50 46,32 58,38 70,24 82,30 94,18 106,22"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<!-- End dot -->
		<circle cx="106" cy="22" r="3.5" fill="var(--dry-color-fill-brand)" />
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
