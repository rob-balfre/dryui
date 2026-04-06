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
	<Svg viewBox="0 0 120 80" aria-label="command-palette thumbnail" width="100%" height="100%">
		<!-- Dimmed backdrop -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-stroke-weak)" opacity="0.3" />
		<!-- Floating card -->
		<rect
			x="16"
			y="8"
			width="88"
			height="64"
			rx="5"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Search input area -->
		<rect
			x="22"
			y="15"
			width="76"
			height="12"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
		/>
		<!-- Search icon -->
		<circle
			cx="31"
			cy="21"
			r="3"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
		/>
		<line
			x1="33.2"
			y1="23.2"
			x2="35"
			y2="25"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			stroke-linecap="round"
		/>
		<!-- Cursor line in input -->
		<rect
			x="38"
			y="18"
			width="20"
			height="2.5"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<!-- Separator -->
		<line x1="22" y1="31" x2="98" y2="31" stroke="var(--dry-color-stroke-weak)" stroke-width="1" />
		<!-- Result items -->
		<rect
			x="22"
			y="35"
			width="76"
			height="9"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.12"
		/>
		<rect
			x="28"
			y="38"
			width="38"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.8"
		/>
		<rect
			x="28"
			y="48"
			width="50"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
		/>
		<rect
			x="28"
			y="57"
			width="42"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.45"
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
