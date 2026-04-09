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
	<Svg viewBox="0 0 120 80" aria-label="progress-ring thumbnail" width="100%" height="100%">
		<!-- Track ring -->
		<circle
			cx="60"
			cy="40"
			r="24"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="7"
		/>
		<!-- Filled arc ~75% — circumference=150.8, 75%=113.1, gap=37.7 -->
		<circle
			cx="60"
			cy="40"
			r="24"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="7"
			stroke-linecap="round"
			stroke-dasharray="113.1 37.7"
			transform="rotate(-90 60 40)"
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
