<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		offset?: number;
		angle?: number;
		children: Snippet;
	}

	let instanceCounter = 0;

	let { offset = 3, angle = 0, children, class: className, style, ...rest }: Props = $props();

	const filterId = `dry-chromatic-${instanceCounter++}`;

	const offsetX = $derived(Math.round(offset * Math.cos((angle * Math.PI) / 180)));
	const offsetY = $derived(Math.round(offset * Math.sin((angle * Math.PI) / 180)));

	function applyFilterStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('filter', `url(#${filterId})`);
		});
	}
</script>

<svg data-chromatic-aberration-svg aria-hidden="true">
	<defs>
		<filter id={filterId} color-interpolation-filters="sRGB">
			<feOffset in="SourceGraphic" dx={offsetX} dy={offsetY} result="red" />
			<feColorMatrix
				in="red"
				type="matrix"
				values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
				result="redOnly"
			/>
			<feOffset in="SourceGraphic" dx={-offsetX} dy={-offsetY} result="blue" />
			<feColorMatrix
				in="blue"
				type="matrix"
				values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
				result="blueOnly"
			/>
			<feColorMatrix
				in="SourceGraphic"
				type="matrix"
				values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
				result="greenOnly"
			/>
			<feBlend in="redOnly" in2="greenOnly" mode="screen" result="rg" />
			<feBlend in="rg" in2="blueOnly" mode="screen" />
		</filter>
	</defs>
</svg>
<div data-chromatic-aberration class={className} use:applyFilterStyles {...rest}>
	{@render children()}
</div>

<style>
	[data-chromatic-aberration-svg] {
		position: absolute;
		height: 0;
		overflow: hidden;
	}

	[data-chromatic-aberration] {
		position: relative;
		border-radius: inherit;
	}
</style>
