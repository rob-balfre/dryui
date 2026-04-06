<script lang="ts">
	import { Svg } from '@dryui/primitives';
	import { applySizeVars } from './apply-size.js';

	interface Props {
		size?: 'sm' | 'md' | 'lg' | number;
		class?: string;
	}

	let { size = 'md', class: className }: Props = $props();

	// Star polygon points centered at cx,cy with outer r=10, inner r=4
	function star(cx: number, cy: number): string {
		const pts: string[] = [];
		for (let i = 0; i < 10; i++) {
			const angle = (Math.PI / 5) * i - Math.PI / 2;
			const r = i % 2 === 0 ? 10 : 4;
			pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
		}
		return pts.join(' ');
	}
</script>

<span
	data-thumbnail
	data-size={typeof size === 'string' ? size : undefined}
	class={className}
	use:applySizeVars={size}
>
	<Svg viewBox="0 0 120 80" aria-label="rating thumbnail" width="100%" height="100%">
		<!-- 5 stars, 3 filled -->
		{#each Array(5) as _, i}
			<polygon
				points={star(13 + i * 22, 40)}
				fill={i < 3 ? 'var(--dry-color-fill-brand)' : 'var(--dry-color-text-weak)'}
				opacity={i < 3 ? 0.85 : 0.25}
			/>
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
