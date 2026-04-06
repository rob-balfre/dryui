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
	<Svg viewBox="0 0 120 80" aria-label="pin-input thumbnail" width="100%" height="100%">
		<!-- 5 PIN boxes -->
		{#each Array(5) as _, i}
			<rect
				x={10 + i * 22}
				y="26"
				width="18"
				height="28"
				rx="4"
				fill={i === 0 ? 'var(--dry-color-fill-brand)' : 'var(--dry-color-bg-raised)'}
				stroke={i === 1 ? 'var(--dry-color-fill-brand)' : 'var(--dry-color-stroke-weak)'}
				stroke-width="1.5"
				opacity={i === 0 ? 0.2 : 1}
			/>
			{#if i === 0}
				<!-- Filled digit dot -->
				<circle cx={19 + i * 22} cy="40" r="4" fill="var(--dry-color-fill-brand)" opacity="0.7" />
			{:else if i === 1}
				<!-- Active cursor -->
				<line
					x1={19 + i * 22}
					y1="32"
					x2={19 + i * 22}
					y2="48"
					stroke="var(--dry-color-fill-brand)"
					stroke-width="1.5"
					stroke-linecap="round"
					opacity="0.8"
				/>
			{/if}
		{/each}
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
