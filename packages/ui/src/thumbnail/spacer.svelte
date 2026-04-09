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
	<Svg viewBox="0 0 120 80" aria-label="spacer thumbnail" width="100%" height="100%">
		<!-- Top rect -->
		<rect
			x="20"
			y="8"
			width="80"
			height="22"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Gap indicator: bracket lines and arrows -->
		<line
			x1="60"
			y1="34"
			x2="60"
			y2="46"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			stroke-dasharray="2 2"
			opacity="0.7"
		/>
		<!-- Top tick -->
		<line
			x1="54"
			y1="34"
			x2="66"
			y2="34"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			opacity="0.7"
		/>
		<!-- Bottom tick -->
		<line
			x1="54"
			y1="46"
			x2="66"
			y2="46"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1"
			opacity="0.7"
		/>
		<!-- Bottom rect -->
		<rect
			x="20"
			y="50"
			width="80"
			height="22"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
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
