<script lang="ts">
	import { Tabs } from '@dryui/ui';
</script>

<Tabs.Root value="overview">
	<Tabs.List>
		<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
		<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
		<Tabs.Trigger value="activity">Activity</Tabs.Trigger>
	</Tabs.List>

	<Tabs.Content value="overview">Overview content</Tabs.Content>
	<Tabs.Content value="settings">Settings content</Tabs.Content>
	<Tabs.Content value="activity">Activity content</Tabs.Content>
</Tabs.Root>
