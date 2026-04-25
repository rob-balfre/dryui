<script lang="ts">
	import { Select } from '@dryui/ui';
</script>

<Select.Root>
	<Select.Trigger>
		<Select.Value placeholder="Choose one" />
	</Select.Trigger>
	<Select.Content>
		<Select.Item value="one">Option one</Select.Item>
		<Select.Item value="two">Option two</Select.Item>
		<Select.Item value="three">Option three</Select.Item>
	</Select.Content>
</Select.Root>
