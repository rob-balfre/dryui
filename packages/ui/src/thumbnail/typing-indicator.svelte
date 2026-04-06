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
	<Svg viewBox="0 0 120 80" aria-label="typing-indicator thumbnail" width="100%" height="100%">
		<!-- Chat bubble background -->
		<rect
			x="22"
			y="24"
			width="54"
			height="32"
			rx="12"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Bubble tail -->
		<path
			d="M22,46 L14,52 L22,50"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
			stroke-linejoin="round"
		/>
		<!-- Three dots (typing) -->
		<circle cx="37" cy="40" r="4.5" fill="var(--dry-color-text-weak)" opacity="0.9" />
		<circle cx="49" cy="40" r="4.5" fill="var(--dry-color-text-weak)" opacity="0.6" />
		<circle cx="61" cy="40" r="4.5" fill="var(--dry-color-text-weak)" opacity="0.35" />
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
