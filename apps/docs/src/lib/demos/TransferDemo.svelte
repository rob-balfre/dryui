<script lang="ts">
	import { Transfer } from '@dryui/ui';

	let available = $state([
		{ key: 'one', label: 'Item 1' },
		{ key: 'two', label: 'Item 2' },
		{ key: 'three', label: 'Item 3' },
		{ key: 'four', label: 'Item 4' }
	]);

	let granted = $state([
		{ key: 'five', label: 'Item 5' },
		{ key: 'six', label: 'Item 6' }
	]);
</script>

<Transfer.Root bind:sourceItems={available} bind:targetItems={granted}>
	<Transfer.List type="source" title="Available" filterable />
	<Transfer.Actions />
	<Transfer.List type="target" title="Selected" filterable />
</Transfer.Root>
