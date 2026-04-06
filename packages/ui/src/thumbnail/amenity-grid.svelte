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
	<Svg viewBox="0 0 120 80" aria-label="amenity grid thumbnail" width="100%" height="100%">
		<!-- Row 1 icons -->
		<circle
			cx="20"
			cy="22"
			r="10"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<path
			d="M16 22 Q20 16 24 22"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
		/>
		<line
			x1="20"
			y1="22"
			x2="20"
			y2="27"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<rect
			x="13"
			y="34"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>

		<circle
			cx="60"
			cy="22"
			r="10"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="56"
			y="18"
			width="8"
			height="5"
			rx="1"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
		/>
		<line x1="58" y1="23" x2="58" y2="27" stroke="var(--dry-color-text-weak)" stroke-width="1.5" />
		<line x1="62" y1="23" x2="62" y2="27" stroke="var(--dry-color-text-weak)" stroke-width="1.5" />
		<rect
			x="53"
			y="34"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>

		<circle
			cx="100"
			cy="22"
			r="10"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<circle
			cx="100"
			cy="20"
			r="3"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
		/>
		<path
			d="M95 28 Q100 24 105 28"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
		/>
		<rect
			x="93"
			y="34"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>

		<!-- Row 2 icons -->
		<circle
			cx="20"
			cy="58"
			r="10"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<path
			d="M17 58 L17 54 Q20 52 23 54 L23 58"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
		/>
		<line
			x1="16"
			y1="62"
			x2="24"
			y2="62"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<rect
			x="13"
			y="70"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>

		<circle
			cx="60"
			cy="58"
			r="10"
			fill="var(--dry-color-fill-brand)"
			opacity="0.12"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1"
		/>
		<path
			d="M56 58 L59 61 L64 55"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.5"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="53"
			y="70"
			width="14"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>

		<circle
			cx="100"
			cy="58"
			r="10"
			fill="var(--dry-color-text-weak)"
			opacity="0.15"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="96"
			y="54"
			width="8"
			height="9"
			rx="1"
			fill="none"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.5"
		/>
		<line x1="98" y1="57" x2="102" y2="57" stroke="var(--dry-color-text-weak)" stroke-width="1" />
		<line x1="98" y1="60" x2="102" y2="60" stroke="var(--dry-color-text-weak)" stroke-width="1" />
		<rect
			x="93"
			y="70"
			width="14"
			height="3"
			rx="1.5"
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
