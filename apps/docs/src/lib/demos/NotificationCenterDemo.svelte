<script lang="ts">
	import { NotificationCenter } from '@dryui/ui';

	let notifications = $state([
		{ id: '1', variant: 'info' as const, read: false },
		{ id: '2', variant: 'info' as const, read: false },
		{ id: '3', variant: 'warning' as const, read: true }
	]);
	let panelOpen = $state(true);
</script>

<div class="demo">
	<NotificationCenter.Root bind:items={notifications} bind:open={panelOpen}>
		<NotificationCenter.Trigger>
			{#snippet children({ unreadCount })}
				Notifications ({unreadCount})
			{/snippet}
		</NotificationCenter.Trigger>
		<NotificationCenter.Panel>
			<NotificationCenter.Group label="Today">
				<NotificationCenter.Item id="1" variant="info"
					>New deployment complete</NotificationCenter.Item
				>
				<NotificationCenter.Item id="2" variant="info"
					>Tests passed on main branch</NotificationCenter.Item
				>
			</NotificationCenter.Group>
			<NotificationCenter.Group label="Yesterday">
				<NotificationCenter.Item id="3" variant="warning" read={true}
					>API rate limit at 80%</NotificationCenter.Item
				>
			</NotificationCenter.Group>
		</NotificationCenter.Panel>
	</NotificationCenter.Root>
</div>

<style>
	.demo {
		display: grid;
		justify-items: end;
		min-height: 18rem;
	}
</style>
