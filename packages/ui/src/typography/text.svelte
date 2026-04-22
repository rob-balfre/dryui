<script lang="ts">
	import type { TextProps } from './index.js';
	import Text from '../text/text.svelte';

	let {
		as = 'p',
		color,
		variant,
		size = 'md',
		font = 'sans',
		weight,
		maxMeasure = false,
		class: className,
		children,
		...rest
	}: TextProps = $props();

	let tone: TextProps['color'] = $derived(
		color ?? (variant === 'muted' || variant === 'secondary' ? variant : 'default')
	);
	let textVariant: 'default' | 'label' = $derived(variant === 'label' ? 'label' : 'default');
</script>

<Text
	{as}
	color={tone}
	{size}
	{font}
	{weight}
	variant={textVariant}
	{maxMeasure}
	{className}
	{...rest}
>
	{@render children()}
</Text>
