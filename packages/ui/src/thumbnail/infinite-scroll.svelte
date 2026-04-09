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
	<Svg viewBox="0 0 120 80" aria-label="infinite-scroll thumbnail" width="100%" height="100%">
		<!-- Content rows -->
		<rect
			x="10"
			y="6"
			width="100"
			height="13"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="18"
			y="11"
			width="52"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>

		<rect
			x="10"
			y="23"
			width="100"
			height="13"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="18"
			y="28"
			width="40"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>

		<rect
			x="10"
			y="40"
			width="100"
			height="13"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
		/>
		<rect
			x="18"
			y="45"
			width="60"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.6"
		/>

		<!-- Faded row -->
		<rect
			x="10"
			y="57"
			width="100"
			height="13"
			rx="3"
			fill="var(--dry-color-bg-raised)"
			stroke="var(--dry-color-stroke-weak)"
			stroke-width="1"
			opacity="0.4"
		/>
		<rect
			x="18"
			y="62"
			width="44"
			height="3"
			rx="1.5"
			fill="var(--dry-color-text-weak)"
			opacity="0.25"
		/>

		<!-- Loading dots -->
		<circle cx="52" cy="76" r="2.5" fill="var(--dry-color-fill-brand)" opacity="0.9" />
		<circle cx="60" cy="76" r="2.5" fill="var(--dry-color-fill-brand)" opacity="0.55" />
		<circle cx="68" cy="76" r="2.5" fill="var(--dry-color-fill-brand)" opacity="0.3" />
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
