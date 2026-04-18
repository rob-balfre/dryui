<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Tabs } from '../../../packages/ui/src/tabs/index.js';

	const items = [
		'overview',
		'analytics',
		'reports',
		'integrations',
		'notifications',
		'billing',
		'team-members',
		'audit-log',
		'developer-tools',
		'advanced-settings'
	];
</script>

<div class="constraint" data-testid="constraint">
	<Tabs.Root value="overview">
		<Tabs.List data-testid="tabs-list">
			{#each items as id (id)}
				<Tabs.Trigger value={id} data-testid="trigger-{id}">{id}</Tabs.Trigger>
			{/each}
		</Tabs.List>
	</Tabs.Root>
</div>

<style>
	.constraint {
		display: grid;
		grid-template-columns: 320px;
	}
</style>
