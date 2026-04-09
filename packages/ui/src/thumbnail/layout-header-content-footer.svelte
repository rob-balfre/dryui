<script lang="ts">
	import { Svg } from '@dryui/primitives';
	import { applySizeVars } from './apply-size.js';
	import LayoutHeader from './_layout-header.svelte';
	import LayoutContent from './_layout-content.svelte';
	import LayoutFooter from './_layout-footer.svelte';

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
	<Svg
		viewBox="0 0 120 80"
		aria-label="Header, content and footer layout"
		width="100%"
		height="100%"
	>
		<!-- Page boundary -->
		<rect
			x="4"
			y="4"
			width="112"
			height="72"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<LayoutHeader x={4} y={4} width={112} height={14} />
		<LayoutContent x={14} y={24} width={92} height={38} />
		<LayoutFooter x={4} y={66} width={112} height={10} />
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
