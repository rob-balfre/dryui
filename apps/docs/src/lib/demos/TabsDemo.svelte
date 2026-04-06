<script lang="ts">
	import { Tabs } from '@dryui/ui';
</script>

<Tabs.Root value="one">
	<Tabs.List>
		<Tabs.Trigger value="one">Tab 1</Tabs.Trigger>
		<Tabs.Trigger value="two">Tab 2</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="one">First panel content</Tabs.Content>
	<Tabs.Content value="two">Second panel content</Tabs.Content>
</Tabs.Root>
