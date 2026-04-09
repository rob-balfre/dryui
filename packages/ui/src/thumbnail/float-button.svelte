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
	<Svg viewBox="0 0 120 80" aria-label="float-button thumbnail" width="100%" height="100%">
		<!-- FAB circle, bottom-right -->
		<circle cx="90" cy="58" r="16" fill="var(--dry-color-fill-brand)" />
		<!-- Plus icon -->
		<line
			x1="90"
			y1="51"
			x2="90"
			y2="65"
			stroke="var(--dry-color-bg-raised)"
			stroke-width="2.5"
			stroke-linecap="round"
		/>
		<line
			x1="83"
			y1="58"
			x2="97"
			y2="58"
			stroke="var(--dry-color-bg-raised)"
			stroke-width="2.5"
			stroke-linecap="round"
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
