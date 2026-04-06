<script lang="ts">
	import { Popover, Button } from '@dryui/ui';

	let popoverOpen = $state(false);
</script>

<Popover.Root bind:open={popoverOpen}>
	<Popover.Trigger><Button variant="outline">Info</Button></Popover.Trigger>
	<Popover.Content>
		<p>Additional details about this item. Click outside to dismiss.</p>
	</Popover.Content>
</Popover.Root>
