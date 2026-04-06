<script lang="ts">
	import { Select } from '@dryui/ui';

	let selected = $state('');
	let selectOpen = $state(false);
</script>

<Select.Root bind:value={selected} bind:open={selectOpen} name="selection">
	<Select.Trigger>
		<Select.Value placeholder="Choose…" />
	</Select.Trigger>
	<Select.Content>
		<Select.Item value="a">Alpha</Select.Item>
		<Select.Item value="b">Beta</Select.Item>
	</Select.Content>
</Select.Root>
