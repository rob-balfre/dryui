<script lang="ts">
	import { MultiSelectCombobox } from '@dryui/ui';
	let value = $state(['design', 'svelte']);
</script>

<MultiSelectCombobox.Root bind:value open={true}>
	<MultiSelectCombobox.SelectionList>
		{#each value as tag (tag)}
			<MultiSelectCombobox.SelectionItem value={tag}>
				{tag}
				<MultiSelectCombobox.SelectionRemove value={tag} />
			</MultiSelectCombobox.SelectionItem>
		{/each}
		<MultiSelectCombobox.Input placeholder="Add tag..." />
	</MultiSelectCombobox.SelectionList>
	<MultiSelectCombobox.Content>
		<MultiSelectCombobox.Item value="design">Design</MultiSelectCombobox.Item>
		<MultiSelectCombobox.Item value="svelte">Svelte</MultiSelectCombobox.Item>
		<MultiSelectCombobox.Item value="typescript">TypeScript</MultiSelectCombobox.Item>
		<MultiSelectCombobox.Item value="accessibility">Accessibility</MultiSelectCombobox.Item>
		<MultiSelectCombobox.Empty>No matches</MultiSelectCombobox.Empty>
	</MultiSelectCombobox.Content>
</MultiSelectCombobox.Root>
