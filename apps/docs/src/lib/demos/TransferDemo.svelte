<script lang="ts">
	import { Transfer } from '@dryui/ui';

	let sourceItems = $state([
		{ key: 'a', label: 'Item A' },
		{ key: 'b', label: 'Item B' }
	]);
	let targetItems = $state([{ key: 'c', label: 'Item C' }]);
</script>

<Transfer.Root bind:sourceItems bind:targetItems>
	<Transfer.List type="source" title="Available" />
	<Transfer.Actions />
	<Transfer.List type="target" title="Selected" />
</Transfer.Root>
