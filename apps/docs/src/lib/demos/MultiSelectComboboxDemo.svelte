<script lang="ts">
	import { MultiSelectCombobox } from '@dryui/ui';

	let selectedFrameworks = $state<string[]>([]);
	let frameworkQuery = $state('');
</script>

<MultiSelectCombobox.Root
	bind:value={selectedFrameworks}
	bind:query={frameworkQuery}
	name="frameworks"
>
	<MultiSelectCombobox.Input placeholder="Search frameworks..." />
	<MultiSelectCombobox.Content>
		<MultiSelectCombobox.Item value="svelte">Svelte</MultiSelectCombobox.Item>
		<MultiSelectCombobox.Item value="react">React</MultiSelectCombobox.Item>
		<MultiSelectCombobox.Item value="vue">Vue</MultiSelectCombobox.Item>
		<MultiSelectCombobox.Item value="angular">Angular</MultiSelectCombobox.Item>
		<MultiSelectCombobox.Item value="solid">SolidJS</MultiSelectCombobox.Item>
	</MultiSelectCombobox.Content>
</MultiSelectCombobox.Root>
