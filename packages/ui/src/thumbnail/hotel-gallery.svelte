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
	<Svg viewBox="0 0 120 80" aria-label="hotel gallery thumbnail" width="100%" height="100%">
		<!-- Main large image -->
		<rect
			x="8"
			y="8"
			width="104"
			height="48"
			rx="4"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Mountain / landscape suggestion in main image -->
		<path
			d="M8 52 L28 28 L48 42 L62 30 L80 48 L112 32 L112 56 L8 56 Z"
			fill="var(--dry-color-text-weak)"
			opacity="0.12"
		/>
		<!-- Sun circle -->
		<circle cx="90" cy="22" r="6" fill="var(--dry-color-text-weak)" opacity="0.2" />
		<!-- Thumbnail row -->
		<rect
			x="8"
			y="62"
			width="22"
			height="14"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="34"
			y="62"
			width="22"
			height="14"
			rx="3"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<rect
			x="60"
			y="62"
			width="22"
			height="14"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="86"
			y="62"
			width="22"
			height="14"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<!-- +N overlay on last thumb -->
		<rect
			x="98"
			y="62"
			width="10"
			height="14"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
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
