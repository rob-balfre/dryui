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
	<Svg viewBox="0 0 120 80" aria-label="transfer thumbnail" width="100%" height="100%">
		<!-- Left list -->
		<rect
			x="6"
			y="10"
			width="44"
			height="60"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="11"
			y="16"
			width="28"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="11"
			y="25"
			width="22"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="11"
			y="34"
			width="30"
			height="4"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>
		<rect
			x="11"
			y="43"
			width="24"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<!-- Arrow buttons in center -->
		<rect
			x="53"
			y="29"
			width="14"
			height="10"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.2"
		/>
		<polyline
			points="56,34 60,31 64,34"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.3"
			stroke-linecap="round"
			stroke-linejoin="round"
			transform="rotate(-90 60 34)"
		/>
		<rect
			x="53"
			y="42"
			width="14"
			height="10"
			rx="3"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.2"
		/>
		<polyline
			points="56,47 60,44 64,47"
			fill="none"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.3"
			stroke-linecap="round"
			stroke-linejoin="round"
			transform="rotate(90 60 47)"
		/>
		<!-- Right list -->
		<rect
			x="70"
			y="10"
			width="44"
			height="60"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="75"
			y="16"
			width="24"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="75"
			y="25"
			width="32"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="75"
			y="34"
			width="20"
			height="4"
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
