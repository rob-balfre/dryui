<script lang="ts">
	import { ToggleGroup, Field, Label } from '@dryui/ui';

	let value = $state<string[]>(['one']);
</script>

<Field.Root>
	<Label>Options</Label>
	<ToggleGroup.Root type="multiple" bind:value>
		<ToggleGroup.Item value="one">One</ToggleGroup.Item>
		<ToggleGroup.Item value="two">Two</ToggleGroup.Item>
		<ToggleGroup.Item value="three">Three</ToggleGroup.Item>
	</ToggleGroup.Root>
</Field.Root>
