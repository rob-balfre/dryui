<script lang="ts">
	import { OptionPicker } from '@dryui/ui';

	const options = ['Option 1', 'Option 2', 'Option 3'];
</script>

<OptionPicker.Root columns={3}>
	{#each options as option (option)}
		<OptionPicker.Item value={option}>
			<OptionPicker.Label>{option}</OptionPicker.Label>
		</OptionPicker.Item>
	{/each}
</OptionPicker.Root>
