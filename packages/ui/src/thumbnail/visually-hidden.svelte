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
	<Svg viewBox="0 0 120 80" aria-label="visually-hidden thumbnail" width="100%" height="100%">
		<!-- Background surface -->
		<rect x="0" y="0" width="120" height="80" fill="var(--dry-color-bg-raised)" />
		<!-- Dashed outline rect (the hidden element) -->
		<rect
			x="18"
			y="20"
			width="84"
			height="40"
			rx="5"
			fill="var(--dry-color-text-weak)"
			opacity="0.07"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-dasharray="5,3"
		/>
		<!-- Content lines inside (faint, suggesting hidden text) -->
		<rect
			x="28"
			y="32"
			width="50"
			height="3.5"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>
		<rect
			x="28"
			y="40"
			width="36"
			height="3.5"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<!-- Eye with slash (crossed-out eye icon) -->
		<!-- Eye outline -->
		<path
			d="M52,40 Q60,30 68,40 Q60,50 52,40 Z"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			opacity="0.6"
		/>
		<!-- Pupil -->
		<circle
			cx="60"
			cy="40"
			r="3"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			opacity="0.6"
		/>
		<!-- Slash line across the eye -->
		<line
			x1="50"
			y1="50"
			x2="70"
			y2="30"
			stroke="var(--dry-color-text-weak)"
			stroke-width="2"
			stroke-linecap="round"
			opacity="0.7"
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
