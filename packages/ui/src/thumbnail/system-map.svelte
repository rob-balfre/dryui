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
	<Svg viewBox="0 0 120 80" aria-label="system-map thumbnail" width="100%" height="100%">
		<rect
			x="5"
			y="6"
			width="34"
			height="68"
			rx="9"
			fill="color-mix(in srgb, var(--dry-color-fill-brand) 10%, var(--dry-color-bg-raised))"
			stroke="color-mix(in srgb, var(--dry-color-fill-brand) 30%, var(--dry-color-stroke-weak))"
		/>
		<rect
			x="43"
			y="6"
			width="34"
			height="68"
			rx="9"
			fill="color-mix(in srgb, var(--dry-color-fill-success) 10%, var(--dry-color-bg-raised))"
			stroke="color-mix(in srgb, var(--dry-color-fill-success) 30%, var(--dry-color-stroke-weak))"
		/>
		<rect
			x="81"
			y="6"
			width="34"
			height="68"
			rx="9"
			fill="color-mix(in srgb, var(--dry-color-fill-info) 10%, var(--dry-color-bg-raised))"
			stroke="color-mix(in srgb, var(--dry-color-fill-info) 30%, var(--dry-color-stroke-weak))"
		/>

		<rect x="11" y="17" width="22" height="4" rx="999" fill="var(--dry-color-fill-brand)" />
		<rect
			x="17"
			y="28"
			width="14"
			height="12"
			rx="4"
			fill="var(--dry-color-bg-base)"
			stroke="var(--dry-color-stroke-weak)"
		/>
		<rect
			x="15"
			y="46"
			width="18"
			height="10"
			rx="4"
			fill="var(--dry-color-bg-base)"
			stroke="var(--dry-color-stroke-weak)"
		/>

		<rect x="49" y="17" width="22" height="4" rx="999" fill="var(--dry-color-fill-success)" />
		<rect
			x="55"
			y="24"
			width="16"
			height="12"
			rx="4"
			fill="var(--dry-color-bg-base)"
			stroke="var(--dry-color-stroke-weak)"
		/>
		<rect
			x="51"
			y="42"
			width="18"
			height="12"
			rx="4"
			fill="var(--dry-color-bg-base)"
			stroke="var(--dry-color-stroke-weak)"
		/>
		<rect
			x="57"
			y="60"
			width="14"
			height="8"
			rx="4"
			fill="var(--dry-color-bg-base)"
			stroke="var(--dry-color-stroke-weak)"
		/>

		<rect x="87" y="17" width="22" height="4" rx="999" fill="var(--dry-color-fill-info)" />
		<rect
			x="91"
			y="32"
			width="14"
			height="12"
			rx="4"
			fill="var(--dry-color-bg-base)"
			stroke="var(--dry-color-stroke-weak)"
		/>
		<rect
			x="87"
			y="52"
			width="18"
			height="10"
			rx="4"
			fill="var(--dry-color-bg-base)"
			stroke="var(--dry-color-stroke-weak)"
		/>

		<path
			d="M 31 34 C 39 34, 43 30, 51 30"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
			stroke-linecap="round"
		/>
		<path
			d="M 69 48 C 77 48, 81 38, 91 38"
			fill="none"
			stroke="var(--dry-color-fill-success)"
			stroke-width="2"
			stroke-linecap="round"
			stroke-dasharray="5 4"
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
