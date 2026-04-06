<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	interface Props extends SVGAttributes<SVGSVGElement> {
		shape?: 'wave' | 'curve' | 'angle' | 'zigzag';
		flip?: boolean;
		color?: string;
		height?: number;
	}

	let { shape = 'wave', flip = false, color, height = 48, ...rest }: Props = $props();

	function applyStyles(node: SVGElement) {
		$effect(() => {
			if (flip) node.style.setProperty('transform', 'scaleY(-1)');
			else node.style.removeProperty('transform');
			if (color) node.style.setProperty('color', color);
			else node.style.removeProperty('color');
		});
	}

	const paths = {
		wave: 'M0,32 C120,64 240,0 360,32 C480,64 600,0 720,32 C840,64 960,0 1080,32 C1200,64 1320,0 1440,32 L1440,96 L0,96 Z',
		curve: 'M0,64 Q720,0 1440,64 L1440,96 L0,96 Z',
		angle: 'M0,96 L720,0 L1440,96 L1440,96 L0,96 Z',
		zigzag: 'M0,48 L180,0 L360,48 L540,0 L720,48 L900,0 L1080,48 L1260,0 L1440,48 L1440,96 L0,96 Z'
	};

	const d = $derived(paths[shape]);
</script>

<svg
	viewBox="0 0 1440 96"
	preserveAspectRatio="none"
	width="100%"
	{height}
	aria-hidden="true"
	use:applyStyles
	{...rest}
>
	<path {d} fill="currentColor" />
</svg>
