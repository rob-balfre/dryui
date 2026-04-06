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
	<Svg viewBox="0 0 120 80" aria-label="noise thumbnail" width="100%" height="100%">
		<!-- Background rect -->
		<rect
			x="8"
			y="8"
			width="104"
			height="64"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Scattered small dots to represent noise texture -->
		<circle cx="20" cy="20" r="1.2" fill="var(--dry-color-text-weak)" opacity="0.6" />
		<circle cx="35" cy="15" r="1" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<circle cx="50" cy="24" r="1.4" fill="var(--dry-color-text-weak)" opacity="0.7" />
		<circle cx="68" cy="18" r="1" fill="var(--dry-color-text-weak)" opacity="0.4" />
		<circle cx="82" cy="22" r="1.2" fill="var(--dry-color-text-weak)" opacity="0.6" />
		<circle cx="100" cy="17" r="1" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<circle cx="25" cy="36" r="1.3" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<circle cx="44" cy="40" r="1" fill="var(--dry-color-text-weak)" opacity="0.6" />
		<circle cx="60" cy="34" r="1.5" fill="var(--dry-color-text-weak)" opacity="0.4" />
		<circle cx="76" cy="42" r="1" fill="var(--dry-color-text-weak)" opacity="0.7" />
		<circle cx="92" cy="36" r="1.2" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<circle cx="108" cy="40" r="1" fill="var(--dry-color-text-weak)" opacity="0.4" />
		<circle cx="18" cy="54" r="1" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<circle cx="38" cy="58" r="1.3" fill="var(--dry-color-text-weak)" opacity="0.6" />
		<circle cx="55" cy="52" r="1" fill="var(--dry-color-text-weak)" opacity="0.4" />
		<circle cx="72" cy="60" r="1.2" fill="var(--dry-color-text-weak)" opacity="0.7" />
		<circle cx="88" cy="56" r="1" fill="var(--dry-color-text-weak)" opacity="0.5" />
		<circle cx="104" cy="62" r="1.4" fill="var(--dry-color-text-weak)" opacity="0.4" />
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
