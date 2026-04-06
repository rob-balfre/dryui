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
	<Svg viewBox="0 0 120 80" aria-label="fare class picker thumbnail" width="100%" height="100%">
		<!-- Economy card (unselected) -->
		<rect
			x="6"
			y="16"
			width="32"
			height="48"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="10"
			y="22"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="12"
			y="29"
			width="20"
			height="12"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<!-- seat icon economy -->
		<path
			d="M18 35 L18 31 L24 31 L24 38 L21 38"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="12"
			y="46"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="14"
			y="52"
			width="20"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>

		<!-- Business card (selected) -->
		<rect
			x="44"
			y="12"
			width="32"
			height="56"
			rx="4"
			fill="var(--dry-color-fill-brand)"
			opacity="0.08"
		/>
		<rect
			x="44"
			y="12"
			width="32"
			height="56"
			rx="4"
			fill="none"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="2"
		/>
		<rect
			x="48"
			y="19"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.7"
		/>
		<rect
			x="50"
			y="26"
			width="20"
			height="14"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.1"
		/>
		<!-- seat icon business (wider) -->
		<path
			d="M55 35 L55 29 L63 29 L63 38 L58 38 L58 36"
			stroke="var(--dry-color-fill-brand)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="50"
			y="47"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-fill-brand)"
			opacity="0.5"
		/>
		<rect
			x="52"
			y="54"
			width="20"
			height="5"
			rx="2"
			fill="var(--dry-color-fill-brand)"
			opacity="0.6"
		/>

		<!-- First card (unselected) -->
		<rect
			x="82"
			y="16"
			width="32"
			height="48"
			rx="4"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1.5"
		/>
		<rect
			x="86"
			y="22"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.5"
		/>
		<rect
			x="88"
			y="29"
			width="20"
			height="12"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.1"
		/>
		<!-- seat icon first (flatbed) -->
		<path
			d="M90 40 L90 31 L100 31 L100 36 L94 36 L94 40"
			stroke="var(--dry-color-text-weak)"
			stroke-width="1.2"
			fill="none"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<rect
			x="88"
			y="46"
			width="24"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.4"
		/>
		<rect
			x="90"
			y="52"
			width="20"
			height="4"
			rx="2"
			fill="var(--dry-color-text-weak)"
			opacity="0.2"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
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
