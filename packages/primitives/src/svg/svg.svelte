<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';

	interface Props extends SVGAttributes<SVGSVGElement> {
		children?: Snippet;
		viewBox?: string;
		'aria-label'?: string;
	}

	let { children, viewBox = '0 0 120 80', role = 'img', ...rest }: Props = $props();
</script>

<svg {viewBox} {role} {...rest}>
	{#if children}{@render children()}{/if}
</svg>
