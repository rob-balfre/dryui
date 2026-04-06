<script>
	import { Combobox } from '@dryui/ui';

	let selectedFramework = $state('');
</script>

<Combobox.Root bind:value={selectedFramework} name="framework">
	<Combobox.Input placeholder="Search frameworks..." />
	<Combobox.Content>
		<Combobox.Item value="svelte" index={0}>Svelte</Combobox.Item>
		<Combobox.Item value="react" index={1}>React</Combobox.Item>
	</Combobox.Content>
</Combobox.Root>
