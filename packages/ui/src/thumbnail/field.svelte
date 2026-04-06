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
	<Svg viewBox="0 0 120 80" aria-label="field thumbnail" width="100%" height="100%">
		<!-- Label line -->
		<rect
			x="10"
			y="12"
			width="28"
			height="5"
			rx="2"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.7"
		/>
		<!-- Input rect -->
		<rect
			x="10"
			y="23"
			width="100"
			height="24"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="17"
			y="32"
			width="50"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Helper text line -->
		<rect
			x="10"
			y="53"
			width="60"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
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
