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
	<Svg viewBox="0 0 120 80" aria-label="date-time-input thumbnail" width="100%" height="100%">
		<!-- Input rect -->
		<rect
			x="8"
			y="26"
			width="104"
			height="28"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<!-- Date segment group -->
		<rect
			x="13"
			y="33"
			width="10"
			height="10"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.15"
		/>
		<rect
			x="14"
			y="36"
			width="8"
			height="4"
			rx="1"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>
		<rect
			x="25"
			y="36"
			width="3"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="30"
			y="33"
			width="10"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<rect
			x="31"
			y="36"
			width="8"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="42"
			y="36"
			width="3"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="47"
			y="33"
			width="14"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<rect
			x="48"
			y="36"
			width="12"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<!-- Spacer -->
		<rect
			x="63"
			y="36"
			width="4"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
		/>
		<!-- Time segment group -->
		<rect
			x="69"
			y="33"
			width="10"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<rect
			x="70"
			y="36"
			width="8"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
		/>
		<rect
			x="81"
			y="36"
			width="3"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="86"
			y="33"
			width="10"
			height="10"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<rect
			x="87"
			y="36"
			width="8"
			height="4"
			rx="1"
			fill="var(--dry-color-text-weak)"
			opacity="0.35"
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
