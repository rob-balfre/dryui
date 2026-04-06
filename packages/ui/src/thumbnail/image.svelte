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
	<Svg viewBox="0 0 120 80" aria-label="image thumbnail" width="100%" height="100%">
		<!-- Image frame -->
		<rect
			x="10"
			y="8"
			width="100"
			height="64"
			rx="6"
			fill="var(--dry-color-text-weak)"
			opacity="0.12"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Sky gradient hint -->
		<rect
			x="10"
			y="8"
			width="100"
			height="32"
			rx="6"
			fill="var(--dry-color-fill-brand)"
			opacity="0.08"
		/>
		<!-- Mountain landscape -->
		<polygon
			points="18,56 38,28 55,44 70,22 92,56"
			fill="var(--dry-color-text-weak)"
			opacity="0.3"
		/>
		<!-- Ground -->
		<rect x="10" y="56" width="100" height="16" fill="var(--dry-color-text-weak)" opacity="0.15" />
		<!-- Sun circle -->
		<circle cx="86" cy="22" r="8" fill="var(--dry-color-fill-brand)" opacity="0.3" />
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
