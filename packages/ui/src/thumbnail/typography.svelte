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
	<Svg viewBox="0 0 120 80" aria-label="typography thumbnail" width="100%" height="100%">
		<!-- Large "Aa" -->
		<text
			x="14"
			y="52"
			font-size="40"
			font-weight="700"
			fill="var(--dry-color-text-weak)"
			opacity="0.75"
			font-family="serif">Aa</text
		>
		<!-- Medium size label -->
		<text
			x="76"
			y="30"
			font-size="18"
			font-weight="500"
			fill="var(--dry-color-text-weak)"
			opacity="0.55"
			font-family="sans-serif">Aa</text
		>
		<!-- Small size label -->
		<text
			x="88"
			y="52"
			font-size="11"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
			font-family="sans-serif">Aa</text
		>
		<!-- Micro -->
		<text
			x="98"
			y="64"
			font-size="8"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
			font-family="sans-serif">Aa</text
		>
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
