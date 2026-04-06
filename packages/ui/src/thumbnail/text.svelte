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
	<Svg viewBox="0 0 120 80" aria-label="text thumbnail" width="100%" height="100%">
		<!-- Line 1 (full width) -->
		<rect
			x="10"
			y="22"
			width="96"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<!-- Line 2 (full width) -->
		<rect
			x="10"
			y="34"
			width="100"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.55"
		/>
		<!-- Line 3 (partial - end of paragraph) -->
		<rect
			x="10"
			y="46"
			width="58"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
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
