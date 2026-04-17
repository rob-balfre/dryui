<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Tabs } from '../../../packages/ui/src/tabs/index.js';

	let {
		initialValue = 'overview',
		orientation = 'horizontal'
	}: {
		initialValue?: string;
		orientation?: 'horizontal' | 'vertical';
	} = $props();

	let value = $state(initialValue);
</script>

<div data-testid="bound-value">{value}</div>

<Tabs.Root bind:value {orientation}>
	<Tabs.List data-testid="tabs-list">
		<Tabs.Trigger value="overview" data-testid="trigger-overview">Overview</Tabs.Trigger>
		<Tabs.Trigger value="analytics" data-testid="trigger-analytics">Analytics</Tabs.Trigger>
		<Tabs.Trigger value="settings" disabled data-testid="trigger-settings">Settings</Tabs.Trigger>
	</Tabs.List>
	<Tabs.Content value="overview" data-testid="panel-overview">Overview panel</Tabs.Content>
	<Tabs.Content value="analytics" data-testid="panel-analytics">Analytics panel</Tabs.Content>
	<Tabs.Content value="settings" data-testid="panel-settings">Settings panel</Tabs.Content>
</Tabs.Root>
