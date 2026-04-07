<script lang="ts">
	import { MultiSelectCombobox } from '@dryui/ui';

	const frameworks = [
		{ value: 'svelte', label: 'Svelte' },
		{ value: 'react', label: 'React' },
		{ value: 'vue', label: 'Vue' },
		{ value: 'angular', label: 'Angular' },
		{ value: 'solid', label: 'SolidJS' }
	] as const;

	let selectedFrameworks = $state<string[]>([]);
	let frameworkQuery = $state('');

	function getFrameworkLabel(value: string) {
		return frameworks.find((framework) => framework.value === value)?.label ?? value;
	}
</script>

<MultiSelectCombobox.Root
	bind:value={selectedFrameworks}
	bind:query={frameworkQuery}
	name="frameworks"
>
	<MultiSelectCombobox.SelectionList>
		{#each selectedFrameworks as framework (framework)}
			<MultiSelectCombobox.SelectionItem value={framework}>
				{getFrameworkLabel(framework)}
				<MultiSelectCombobox.SelectionRemove
					value={framework}
					label={getFrameworkLabel(framework)}
				/>
			</MultiSelectCombobox.SelectionItem>
		{/each}
	</MultiSelectCombobox.SelectionList>

	<MultiSelectCombobox.Input placeholder="Search frameworks..." />
	<MultiSelectCombobox.Content>
		{#each frameworks as framework (framework.value)}
			<MultiSelectCombobox.Item value={framework.value}>
				{framework.label}
			</MultiSelectCombobox.Item>
		{/each}
	</MultiSelectCombobox.Content>
</MultiSelectCombobox.Root>
