<script lang="ts">
	import { RadioGroup, Field, Label } from '@dryui/ui';

	let value = $state('option-2');
</script>

<Field.Root>
	<Label>Choose an option</Label>
	<RadioGroup.Root bind:value name="demo-options">
		<RadioGroup.Item value="option-1">Option 1</RadioGroup.Item>
		<RadioGroup.Item value="option-2">Option 2</RadioGroup.Item>
		<RadioGroup.Item value="option-3">Option 3</RadioGroup.Item>
		<RadioGroup.Item value="option-4" disabled>Option 4</RadioGroup.Item>
	</RadioGroup.Root>
</Field.Root>
