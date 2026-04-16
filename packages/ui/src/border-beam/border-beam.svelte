<script lang="ts">
	import {
		BorderBeam as BorderBeamPrimitive,
		type BorderBeamProps
	} from '@dryui/primitives/border-beam';

	let {
		size,
		colorVariant,
		theme,
		staticColors,
		duration,
		active,
		borderRadius,
		brightness,
		saturation,
		hueRange,
		strength,
		onActivate,
		onDeactivate,
		children,
		...rest
	}: BorderBeamProps = $props();
</script>

<BorderBeamPrimitive
	{size}
	{colorVariant}
	{theme}
	{staticColors}
	{duration}
	{active}
	{borderRadius}
	{brightness}
	{saturation}
	{hueRange}
	{strength}
	{onActivate}
	{onDeactivate}
	{children}
	{...rest}
/>
