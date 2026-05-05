<script lang="ts">
	import { Button, Popover } from '@dryui/ui';
</script>

<Popover.Root>
	<Popover.Trigger>
		<Button variant="outline">Open popover</Button>
	</Popover.Trigger>
	<Popover.Content placement="bottom-start">
		<p>Popover content</p>
	</Popover.Content>
</Popover.Root>
