<script lang="ts">
	import { ToggleGroup } from '@dryui/ui';

	let alignment = $state<string[]>(['left']);
</script>

<ToggleGroup.Root bind:value={alignment}>
	<ToggleGroup.Item value="left">Left</ToggleGroup.Item>
	<ToggleGroup.Item value="center">Center</ToggleGroup.Item>
	<ToggleGroup.Item value="right">Right</ToggleGroup.Item>
</ToggleGroup.Root>
