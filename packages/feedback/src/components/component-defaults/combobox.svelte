<script lang="ts">
	import { Combobox } from '@dryui/ui';
</script>

<Combobox.Root>
	<Combobox.Input placeholder="Search..." />
	<Combobox.Content>
		<Combobox.Item value="apple" index={0}>Apple</Combobox.Item>
		<Combobox.Item value="banana" index={1}>Banana</Combobox.Item>
		<Combobox.Item value="cherry" index={2}>Cherry</Combobox.Item>
		<Combobox.Empty>No results</Combobox.Empty>
	</Combobox.Content>
</Combobox.Root>
