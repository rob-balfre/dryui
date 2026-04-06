<script lang="ts">
	import { InputGroup } from '@dryui/ui';

	let amount = $state('249');
</script>

<InputGroup.Root>
	<InputGroup.Prefix>$</InputGroup.Prefix>
	<InputGroup.Input bind:value={amount} placeholder="Amount" />
	<InputGroup.Suffix>USD</InputGroup.Suffix>
	<InputGroup.Action>Apply</InputGroup.Action>
</InputGroup.Root>
