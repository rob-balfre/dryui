<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Combobox } from '../../../packages/ui/src/combobox/index.js';

	let value = $state('');
	let open = $state(false);
</script>

<output data-testid="bound-value">{value}</output>
<output data-testid="bound-open">{String(open)}</output>

<Combobox.Root bind:value bind:open name="framework">
	<Combobox.Input
		placeholder="Search frameworks..."
		aria-label="Framework"
		data-testid="combobox-input"
	/>
	<Combobox.Content data-testid="combobox-content">
		<Combobox.Item value="svelte" index={0} data-testid="item-svelte">Svelte</Combobox.Item>
		<Combobox.Item value="react" index={1} data-testid="item-react">React</Combobox.Item>
		<Combobox.Item value="vue" index={2} data-testid="item-vue">Vue</Combobox.Item>
	</Combobox.Content>
</Combobox.Root>
