<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { Svg as SvgPrimitive } from '@dryui/primitives/svg';

	interface Props extends SVGAttributes<SVGSVGElement> {
		children?: Snippet;
		viewBox?: string;
		'aria-label'?: string;
	}

	let { children, ...rest }: Props = $props();
</script>

<SvgPrimitive {...rest}>
	{#if children}
		{@render children()}
	{/if}
</SvgPrimitive>
