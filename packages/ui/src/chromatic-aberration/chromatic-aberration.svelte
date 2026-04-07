<script lang="ts">
	import { createId } from '@dryui/primitives';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		offset?: number;
		angle?: number;
		children: Snippet;
	}

	let { offset = 3, angle = 0, children, class: className, style, ...rest }: Props = $props();

	const filterId = createId('dry-chromatic');

	const offsetX = $derived(Math.round(offset * Math.cos((angle * Math.PI) / 180)));
	const offsetY = $derived(Math.round(offset * Math.sin((angle * Math.PI) / 180)));

	function applyFilterStyles(node: HTMLElement) {
		node.style.cssText = style || '';
		node.style.setProperty('filter', `url(#${filterId})`);
	}
</script>

<svg data-chromatic-aberration-svg width="0" height="0" aria-hidden="true">
	<defs>
		<filter id={filterId} color-interpolation-filters="sRGB">
			<feOffset in="SourceGraphic" dx={offsetX} dy={offsetY} result="lightRed" />
			<feColorMatrix
				in="lightRed"
				type="matrix"
				values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
				result="lightRedOnly"
			/>
			<feOffset in="SourceGraphic" dx={-offsetX} dy={-offsetY} result="lightBlue" />
			<feColorMatrix
				in="lightBlue"
				type="matrix"
				values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
				result="lightBlueOnly"
			/>
			<feColorMatrix
				in="SourceGraphic"
				type="matrix"
				values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
				result="lightGreenOnly"
			/>
			<feBlend in="lightRedOnly" in2="lightGreenOnly" mode="screen" result="lightRG" />
			<feBlend in="lightRG" in2="lightBlueOnly" mode="screen" result="lightSplit" />
			<feColorMatrix
				in="SourceGraphic"
				type="matrix"
				values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
				result="darkSource"
			/>
			<feOffset in="darkSource" dx={offsetX} dy={offsetY} result="darkRed" />
			<feColorMatrix
				in="darkRed"
				type="matrix"
				values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
				result="darkRedOnly"
			/>
			<feOffset in="darkSource" dx={-offsetX} dy={-offsetY} result="darkBlue" />
			<feColorMatrix
				in="darkBlue"
				type="matrix"
				values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
				result="darkBlueOnly"
			/>
			<feColorMatrix
				in="darkSource"
				type="matrix"
				values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
				result="darkGreenOnly"
			/>
			<feBlend in="darkRedOnly" in2="darkGreenOnly" mode="screen" result="darkRG" />
			<feBlend in="darkRG" in2="darkBlueOnly" mode="screen" result="darkSplitInverted" />
			<feColorMatrix
				in="darkSplitInverted"
				type="matrix"
				values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"
				result="darkSplit"
			/>
			<feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="lightMask" />
			<feComponentTransfer in="lightMask" result="darkMask">
				<feFuncA type="table" tableValues="1 0" />
			</feComponentTransfer>
			<feComposite in="lightSplit" in2="lightMask" operator="in" result="lightApplied" />
			<feComposite in="darkSplit" in2="darkMask" operator="in" result="darkApplied" />
			<feMerge>
				<feMergeNode in="lightApplied" />
				<feMergeNode in="darkApplied" />
			</feMerge>
		</filter>
	</defs>
</svg>
<div data-chromatic-aberration class={className} {@attach applyFilterStyles} {...rest}>
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
