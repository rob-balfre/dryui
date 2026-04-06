<script lang="ts">
	import { Tabs } from '@dryui/ui';
	import Configurator from '$lib/components/Configurator.svelte';
	import type { ConfigControl, ConfigValues } from './types';

	type TabsOrientation = 'horizontal' | 'vertical';
	type TabsActivationMode = 'automatic' | 'manual';
	type TabsSize = 'sm' | 'md' | 'lg';

	const controls = [
		{
			key: 'orientation',
			label: 'Orientation',
			type: 'select',
			defaultValue: 'horizontal',
			options: [
				{ label: 'Horizontal', value: 'horizontal' },
				{ label: 'Vertical', value: 'vertical' }
			],
			description:
				'Switch orientation to see whether the layout still reads clearly in narrow spaces.'
		},
		{
			key: 'activationMode',
			label: 'Activation mode',
			type: 'select',
			defaultValue: 'automatic',
			options: [
				{ label: 'Automatic', value: 'automatic' },
				{ label: 'Manual', value: 'manual' }
			],
			description:
				'Manual activation is useful when moving focus should not immediately switch context.'
		},
		{
			key: 'size',
			label: 'Trigger size',
			type: 'select',
			defaultValue: 'md',
			options: [
				{ label: 'Small', value: 'sm' },
				{ label: 'Medium', value: 'md' },
				{ label: 'Large', value: 'lg' }
			],
			description: 'Keep tab labels concise so the list stays scan-friendly at every size.'
		}
	] satisfies ConfigControl[];

	let value = $state('overview');

	function getCode(values: ConfigValues) {
		const orientation = values.orientation as TabsOrientation;
		const activationMode = values.activationMode as TabsActivationMode;
		const size = values.size as TabsSize;

		return `<Tabs.Root bind:value={activeTab} orientation="${orientation}" activationMode="${activationMode}">\n  <Tabs.List>\n    <Tabs.Trigger value="overview" size="${size}">Overview</Tabs.Trigger>\n    <Tabs.Trigger value="activity" size="${size}">Activity</Tabs.Trigger>\n    <Tabs.Trigger value="billing" size="${size}">Billing</Tabs.Trigger>\n  </Tabs.List>\n  <Tabs.Content value="overview">Project summary and current status.</Tabs.Content>\n  <Tabs.Content value="activity">Recent edits, comments, and updates.</Tabs.Content>\n  <Tabs.Content value="billing">Plan details and upcoming invoices.</Tabs.Content>\n</Tabs.Root>`;
	}
</script>

<Configurator
	title="Tabs Configurator"
	description="Adjust orientation, activation mode, and density before you commit to a multi-panel navigation pattern."
	{controls}
	code={getCode}
>
	{#snippet preview(values)}
		<div class="tabs-preview">
			<Tabs.Root
				bind:value
				orientation={values.orientation as TabsOrientation}
				activationMode={values.activationMode as TabsActivationMode}
			>
				<Tabs.List>
					<Tabs.Trigger value="overview" size={values.size as TabsSize}>Overview</Tabs.Trigger>
					<Tabs.Trigger value="activity" size={values.size as TabsSize}>Activity</Tabs.Trigger>
					<Tabs.Trigger value="billing" size={values.size as TabsSize}>Billing</Tabs.Trigger>
				</Tabs.List>

				<Tabs.Content value="overview">
					<p class="tabs-content">Project summary and current status for the rollout.</p>
				</Tabs.Content>
				<Tabs.Content value="activity">
					<p class="tabs-content">Recent edits, comments, and release notes from the team.</p>
				</Tabs.Content>
				<Tabs.Content value="billing">
					<p class="tabs-content">Plan details, renewal timing, and the latest invoice status.</p>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	{/snippet}
</Configurator>

<!-- svelte-ignore css_unused_selector -->
<style>
	.tabs-preview {
		display: grid;
		grid-template-columns: minmax(0, 34rem);
	}

	.tabs-content {
		padding-top: var(--dry-space-4);
	}
</style>
