<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	interface Props extends SVGAttributes<SVGSVGElement> {
		label?: string | undefined;
	}

	let { label = 'Loading', ...rest }: Props = $props();
</script>

<svg
	role="status"
	aria-label={label}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	{...rest}
>
	<circle
		cx="12"
		cy="12"
		r="10"
		stroke="currentColor"
		stroke-width="3"
		stroke-linecap="round"
		stroke-dasharray="31.42 31.42"
	/>
</svg>
