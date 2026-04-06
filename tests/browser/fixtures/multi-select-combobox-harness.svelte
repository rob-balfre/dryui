<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { MultiSelectCombobox } from '../../../packages/ui/src/multi-select-combobox/index.js';

	type Option = {
		value: string;
		label: string;
		group: 'Engineering' | 'Design';
		disabled?: boolean;
	};

	const options: Option[] = [
		{ value: 'maya', label: 'Maya Chen', group: 'Engineering' },
		{ value: 'morgan', label: 'Morgan Diaz', group: 'Engineering', disabled: true },
		{ value: 'jordan', label: 'Jordan Lee', group: 'Design' },
		{ value: 'priya', label: 'Priya Patel', group: 'Design' }
	];

	let { maxSelections = 2, name = 'assignees' }: { maxSelections?: number; name?: string } =
		$props();

	let value = $state<string[]>([]);
	let query = $state('');

	const filteredGroups = $derived.by(() => {
		const normalized = query.trim().toLowerCase();
		const filtered = normalized
			? options.filter((option) => option.label.toLowerCase().includes(normalized))
			: options;

		return [
			{
				label: 'Engineering',
				items: filtered.filter((option) => option.group === 'Engineering')
			},
			{
				label: 'Design',
				items: filtered.filter((option) => option.group === 'Design')
			}
		].filter((group) => group.items.length > 0);
	});

	function getLabel(selectedValue: string) {
		return options.find((option) => option.value === selectedValue)?.label ?? selectedValue;
	}
</script>

<div data-testid="surface">
	<MultiSelectCombobox.Root bind:value bind:query {maxSelections} {name}>
		<MultiSelectCombobox.SelectionList>
			{#each value as selectedValue (selectedValue)}
				<MultiSelectCombobox.SelectionItem value={selectedValue}>
					{getLabel(selectedValue)}
					<MultiSelectCombobox.SelectionRemove
						value={selectedValue}
						label={getLabel(selectedValue)}
					/>
				</MultiSelectCombobox.SelectionItem>
			{/each}
		</MultiSelectCombobox.SelectionList>

		<MultiSelectCombobox.Input placeholder="Search teammates..." aria-label="Assignees" />

		<MultiSelectCombobox.Content>
			{#each filteredGroups as group (group.label)}
				<MultiSelectCombobox.Group label={group.label}>
					{#each group.items as option (option.value)}
						<MultiSelectCombobox.Item
							value={option.value}
							textValue={option.label}
							disabled={option.disabled}
						>
							{option.label}
						</MultiSelectCombobox.Item>
					{/each}
				</MultiSelectCombobox.Group>
			{/each}

			<MultiSelectCombobox.Empty>No matches found.</MultiSelectCombobox.Empty>
		</MultiSelectCombobox.Content>
	</MultiSelectCombobox.Root>
</div>

<output data-testid="value">{value.join(',')}</output>
<output data-testid="query">{query}</output>
