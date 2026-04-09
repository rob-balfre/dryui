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
	<Svg viewBox="0 0 120 80" aria-label="table-of-contents thumbnail" width="100%" height="100%">
		<!-- Level 1 items -->
		<rect
			x="12"
			y="12"
			width="46"
			height="6"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Level 2 items (indented) -->
		<rect
			x="20"
			y="23"
			width="36"
			height="5"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<rect
			x="20"
			y="32"
			width="40"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Level 3 item (more indented) -->
		<rect
			x="28"
			y="41"
			width="28"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Level 1 item -->
		<rect
			x="12"
			y="51"
			width="50"
			height="6"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.7"
		/>
		<!-- Level 2 item -->
		<rect
			x="20"
			y="62"
			width="38"
			height="5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
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
