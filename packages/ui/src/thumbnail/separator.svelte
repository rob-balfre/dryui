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
	<Svg viewBox="0 0 120 80" aria-label="separator thumbnail" width="100%" height="100%">
		<!-- Content above -->
		<line
			x1="20"
			y1="24"
			x2="100"
			y2="24"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
			opacity="0.5"
		/>
		<line
			x1="20"
			y1="32"
			x2="80"
			y2="32"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.35"
		/>
		<!-- Separator line centered vertically -->
		<line
			x1="10"
			y1="40"
			x2="110"
			y2="40"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<!-- Content below -->
		<line
			x1="20"
			y1="50"
			x2="90"
			y2="50"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
			opacity="0.5"
		/>
		<line
			x1="20"
			y1="58"
			x2="75"
			y2="58"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-linecap="round"
			opacity="0.35"
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
