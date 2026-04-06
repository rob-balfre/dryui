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
	<Svg viewBox="0 0 120 80" aria-label="radio-group thumbnail" width="100%" height="100%">
		<!-- Radio 1 (selected) -->
		<circle
			cx="26"
			cy="22"
			r="9"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.8"
		/>
		<circle cx="26" cy="22" r="5" fill="var(--dry-color-fill-brand)" opacity="0.85" />
		<rect
			x="42"
			y="19"
			width="36"
			height="5"
			rx="2"
			fill="var(--dry-color-stroke-weak)"
			opacity="0.6"
		/>
		<!-- Radio 2 (unselected) -->
		<circle
			cx="26"
			cy="40"
			r="9"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.8"
		/>
		<rect
			x="42"
			y="37"
			width="30"
			height="5"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Radio 3 (unselected) -->
		<circle
			cx="26"
			cy="58"
			r="9"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.8"
		/>
		<rect
			x="42"
			y="55"
			width="40"
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
