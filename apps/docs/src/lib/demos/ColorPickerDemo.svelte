<script lang="ts">
	import { ColorPicker, Field, Label } from '@dryui/ui';

	let color = $state('#ff7a45');
</script>

<Field.Root>
	<Label>Color</Label>
	<ColorPicker.Root bind:value={color}>
		<ColorPicker.Area />
		<ColorPicker.HueSlider />
		<ColorPicker.AlphaSlider />
		<ColorPicker.Input format="hex" />
	</ColorPicker.Root>
</Field.Root>
