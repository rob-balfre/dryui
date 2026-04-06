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
	<Svg viewBox="0 0 120 80" aria-label="list thumbnail" width="100%" height="100%">
		<!-- Row 1 -->
		<circle cx="20" cy="20" r="3" fill="var(--dry-color-fill-brand)" opacity="0.7" />
		<rect
			x="30"
			y="17"
			width="72"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Row 2 -->
		<circle cx="20" cy="36" r="3" fill="var(--dry-color-fill-brand)" opacity="0.7" />
		<rect
			x="30"
			y="33"
			width="56"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>
		<!-- Row 3 -->
		<circle cx="20" cy="52" r="3" fill="var(--dry-color-fill-brand)" opacity="0.7" />
		<rect
			x="30"
			y="49"
			width="64"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.55"
		/>
		<!-- Row 4 -->
		<circle cx="20" cy="68" r="3" fill="var(--dry-color-fill-brand)" opacity="0.7" />
		<rect
			x="30"
			y="65"
			width="44"
			height="5"
			rx="2"
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
