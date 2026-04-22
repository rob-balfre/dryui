<script lang="ts">
	import type { HeadingProps } from './index.js';
	import Heading from '../heading/heading.svelte';

	let {
		level = 2,
		variant = 'default',
		maxMeasure = false,
		class: className,
		children,
		...rest
	}: HeadingProps = $props();
</script>

<Heading {level} {variant} {maxMeasure} {className} {...rest}>
	{@render children()}
</Heading>
