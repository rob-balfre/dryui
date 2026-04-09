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
	<Svg viewBox="0 0 120 80" aria-label="checkbox thumbnail" width="100%" height="100%">
		<!-- Checkbox square -->
		<rect
			x="40"
			y="22"
			width="28"
			height="28"
			rx="5"
			fill="var(--dry-color-fill-brand)"
			stroke="none"
		/>
		<!-- Checkmark -->
		<polyline
			points="47,36 53,43 63,30"
			fill="none"
			stroke="var(--dry-color-bg-raised)"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<!-- Label line -->
		<rect
			x="76"
			y="33"
			width="28"
			height="5"
			rx="2"
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
