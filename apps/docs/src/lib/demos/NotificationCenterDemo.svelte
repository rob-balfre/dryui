<script lang="ts">
	import { NotificationCenter } from '@dryui/ui';

	let notifications = $state([
		{ id: 'n1', variant: 'info' as const, read: false },
		{ id: 'n2', variant: 'info' as const, read: false },
		{ id: 'n3', variant: 'warning' as const, read: true }
	]);
</script>

<NotificationCenter.Root bind:items={notifications}>
	<NotificationCenter.Trigger>Inbox</NotificationCenter.Trigger>
	<NotificationCenter.Panel>
		<NotificationCenter.Group label="Today">
			<NotificationCenter.Item id="n1" variant="info">Item 1</NotificationCenter.Item>
			<NotificationCenter.Item id="n2" variant="info">Item 2</NotificationCenter.Item>
		</NotificationCenter.Group>
		<NotificationCenter.Group label="Earlier">
			<NotificationCenter.Item id="n3" read>Item 3</NotificationCenter.Item>
		</NotificationCenter.Group>
	</NotificationCenter.Panel>
</NotificationCenter.Root>
