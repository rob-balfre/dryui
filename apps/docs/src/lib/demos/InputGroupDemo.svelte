<script lang="ts">
	import { InputGroup } from '@dryui/ui';

	let amount = $state('249');
</script>

<InputGroup.Root>
	<InputGroup.Prefix>$</InputGroup.Prefix>
	<InputGroup.Input>
		<input data-input-group-input bind:value={amount} placeholder="Amount" />
	</InputGroup.Input>
	<InputGroup.Suffix>USD</InputGroup.Suffix>
	<InputGroup.Action>Apply</InputGroup.Action>
</InputGroup.Root>
