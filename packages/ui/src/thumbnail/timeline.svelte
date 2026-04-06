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
	<Svg viewBox="0 0 120 80" aria-label="timeline thumbnail" width="100%" height="100%">
		<!-- Vertical line -->
		<line
			x1="28"
			y1="8"
			x2="28"
			y2="72"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="2"
			stroke-linecap="round"
		/>

		<!-- Event 1 (top, filled = current) -->
		<circle cx="28" cy="18" r="6" fill="var(--dry-color-fill-brand)" />
		<circle cx="28" cy="18" r="3" fill="var(--dry-color-bg-raised)" />
		<rect
			x="42"
			y="14"
			width="52"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.75"
		/>
		<rect
			x="42"
			y="22"
			width="36"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>

		<!-- Event 2 -->
		<circle
			cx="28"
			cy="42"
			r="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="2"
		/>
		<circle cx="28" cy="42" r="2.5" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<rect
			x="42"
			y="38"
			width="44"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<rect
			x="42"
			y="46"
			width="28"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>

		<!-- Event 3 -->
		<circle
			cx="28"
			cy="66"
			r="6"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="2"
		/>
		<circle cx="28" cy="66" r="2.5" fill="var(--dry-color-text-weak)" opacity="0.4" />
		<rect
			x="42"
			y="62"
			width="36"
			height="5"
			rx="2.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
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
