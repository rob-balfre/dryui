<script lang="ts">
	import type { HeadingProps } from './index.js';
	import Heading from '../heading/heading.svelte';

	let {
		level = 2,
		variant = 'default',
		maxMeasure = false,
		class: _class,
		children,
		...rest
	}: HeadingProps = $props();
</script>

<Heading {level} {variant} {maxMeasure} {...rest}>
	{@render children()}
</Heading>
