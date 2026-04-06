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
	<Svg viewBox="0 0 120 80" aria-label="avatar thumbnail" width="100%" height="100%">
		<circle cx="60" cy="40" r="26" fill="var(--dry-color-fill-brand)" opacity="0.2" />
		<circle
			cx="60"
			cy="40"
			r="26"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
		/>
		<text
			x="60"
			y="46"
			text-anchor="middle"
			font-size="18"
			font-weight="600"
			fill="var(--dry-color-fill-brand)"
			font-family="sans-serif">AB</text
		>
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
