<script lang="ts">
	import type { HeadingProps } from './index.js';
	import Heading from '../heading/heading.svelte';

	let {
		level = 2,
		variant = 'default',
		class: className,
		children,
		...rest
	}: HeadingProps = $props();
</script>

<Heading {level} {variant} {className} {...rest}>
	{@render children()}
</Heading>
