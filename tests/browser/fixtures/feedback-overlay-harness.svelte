<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Feedback } from '../../../packages/feedback/src/index.js';
	import { Button } from '../../../packages/ui/src/button/index.js';
	import { CommandPalette } from '../../../packages/ui/src/command-palette/index.js';
	import { DatePicker } from '../../../packages/ui/src/date-picker/index.js';
	import { Popover } from '../../../packages/ui/src/popover/index.js';

	type HostKind = 'command-palette' | 'date-picker' | 'popover';

	let { kind, serverUrl }: { kind: HostKind; serverUrl?: string } = $props();
</script>

<Feedback {serverUrl} />

{#if kind === 'command-palette'}
	<CommandPalette.Root open={true}>
		<CommandPalette.Input placeholder="Search commands" />
		<CommandPalette.List>
			<CommandPalette.Group heading="Actions">
				<CommandPalette.Item value="open">Open file</CommandPalette.Item>
			</CommandPalette.Group>
		</CommandPalette.List>
	</CommandPalette.Root>
{:else}
	<div class="popover-host">
		{#if kind === 'date-picker'}
			<DatePicker.Root open={true} value={new Date(2026, 4, 2)}>
				<DatePicker.Trigger placeholder="Select date" data-testid="date-picker-trigger" />
				<DatePicker.Content data-testid="date-picker-content">
					<DatePicker.Calendar />
				</DatePicker.Content>
			</DatePicker.Root>
		{:else}
			<Popover.Root open={true}>
				<Popover.Trigger>
					<Button variant="outline">Open details</Button>
				</Popover.Trigger>
				<Popover.Content>
					<div class="popover-body">Overlay content</div>
				</Popover.Content>
			</Popover.Root>
		{/if}
	</div>
{/if}

<style>
	.popover-host {
		display: grid;
		padding: 5rem;
	}

	.popover-body {
		display: grid;
		gap: var(--dry-space-2);
	}
</style>
