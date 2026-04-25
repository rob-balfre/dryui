<script lang="ts">
	import { InputGroup } from '@dryui/ui';

	let amount = $state('249');
</script>

<InputGroup.Root>
	<InputGroup.Prefix>$</InputGroup.Prefix>
	<InputGroup.Input bind:value={amount} placeholder="0.00" />
	<InputGroup.Suffix>USD</InputGroup.Suffix>
	<InputGroup.Separator />
	<InputGroup.Action>Apply</InputGroup.Action>
</InputGroup.Root>
