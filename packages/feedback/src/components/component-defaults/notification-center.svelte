<script lang="ts">
	import { NotificationCenter } from '@dryui/ui';
	let items = $state([
		{ id: 'n1', read: false },
		{ id: 'n2', read: false },
		{ id: 'n3', read: true }
	]);
</script>

<NotificationCenter.Root bind:items open={true}>
	<NotificationCenter.Trigger>
		{#snippet children({ unreadCount }: { unreadCount: number })}
			Inbox ({unreadCount})
		{/snippet}
	</NotificationCenter.Trigger>
	<NotificationCenter.Panel>
		<NotificationCenter.Group label="Today">
			<NotificationCenter.Item id="n1" variant="info">
				Deploy finished on main
			</NotificationCenter.Item>
			<NotificationCenter.Item id="n2" variant="warning">
				Card expires next week
			</NotificationCenter.Item>
		</NotificationCenter.Group>
		<NotificationCenter.Group label="Earlier">
			<NotificationCenter.Item id="n3" read>Usage at 80% for April</NotificationCenter.Item>
		</NotificationCenter.Group>
	</NotificationCenter.Panel>
</NotificationCenter.Root>
