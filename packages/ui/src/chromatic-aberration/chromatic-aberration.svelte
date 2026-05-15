<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		offset?: number;
		angle?: number;
		children: Snippet;
	}

	let { offset = 3, angle = 0, children, class: className, style, ...rest }: Props = $props();

	const uid = $props.id();
	const filterId = `dry-chromatic-${uid}`;

	const offsetX = $derived(Math.round(offset * Math.cos((angle * Math.PI) / 180)));
	const offsetY = $derived(Math.round(offset * Math.sin((angle * Math.PI) / 180)));

	// Flash-on-load: filter references a runtime-generated SVG filter ID (url(#${filterId})),
	// so no CSS default is possible — the ID isn't known until mount. The SVG <filter> element
	// is in the same template, so the $effect runs synchronously after first paint.
	let el = $state<HTMLDivElement>();

	$effect(() => {
		if (!el) return;
		el.style.cssText = style || '';
		el.style.setProperty('filter', `url(#${filterId})`);
	});
</script>

<svg data-chromatic-aberration-svg width="0" height="0" aria-hidden="true">
	<defs>
		<filter
			id={filterId}
			color-interpolation-filters="sRGB"
			x="-20%"
			y="-20%"
			width="140%"
			height="140%"
		>
			<feOffset in="SourceAlpha" dx={offsetX} dy={offsetY} result="redAlpha" />
			<feFlood flood-color="rgb(255, 24, 86)" flood-opacity="0.62" result="redFlood" />
			<feComposite in="redFlood" in2="redAlpha" operator="in" result="redFringe" />
			<feOffset in="SourceGraphic" dx={offsetX} dy={offsetY} result="red" />
			<feColorMatrix
				in="red"
				type="matrix"
				values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
				result="redSignal"
			/>
			<feBlend in="redFringe" in2="redSignal" mode="screen" result="redOnly" />
			<feOffset in="SourceAlpha" dx={-offsetX} dy={-offsetY} result="blueAlpha" />
			<feFlood flood-color="rgb(0, 132, 255)" flood-opacity="0.62" result="blueFlood" />
			<feComposite in="blueFlood" in2="blueAlpha" operator="in" result="blueFringe" />
			<feOffset in="SourceGraphic" dx={-offsetX} dy={-offsetY} result="blue" />
			<feColorMatrix
				in="blue"
				type="matrix"
				values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 1 0 0"
				result="blueSignal"
			/>
			<feBlend in="blueFringe" in2="blueSignal" mode="screen" result="blueOnly" />
			<feMerge>
				<feMergeNode in="redOnly" />
				<feMergeNode in="blueOnly" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>
</svg>
<div bind:this={el} data-chromatic-aberration class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-chromatic-aberration-svg] {
		position: absolute;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	}

	[data-chromatic-aberration] {
		position: relative;
		border-radius: inherit;
	}
</style>
