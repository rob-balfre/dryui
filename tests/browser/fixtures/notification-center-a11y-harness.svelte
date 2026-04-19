<script lang="ts">
	import { NotificationCenter } from '../../../packages/ui/src/notification-center/index.js';

	let items = $state([
		{ id: 'deploy', read: false, variant: 'info' as const },
		{ id: 'incident', read: true, variant: 'warning' as const }
	]);
	let open = $state(true);
</script>

<NotificationCenter.Root bind:items bind:open>
	<NotificationCenter.Trigger>
		{#snippet children({ unreadCount })}
			Notifications ({unreadCount})
		{/snippet}
	</NotificationCenter.Trigger>

	<NotificationCenter.Panel>
		<NotificationCenter.Group label="Today">
			<NotificationCenter.Item id="deploy" variant="info">Deploy finished</NotificationCenter.Item>
		</NotificationCenter.Group>
	</NotificationCenter.Panel>
</NotificationCenter.Root>
