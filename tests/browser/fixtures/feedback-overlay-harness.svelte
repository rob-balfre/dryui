<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Feedback } from '../../../packages/feedback/src/index.js';
	import { Button } from '../../../packages/ui/src/button/index.js';
	import { CommandPalette } from '../../../packages/ui/src/command-palette/index.js';
	import { Popover } from '../../../packages/ui/src/popover/index.js';

	type HostKind = 'command-palette' | 'popover';

	let { kind }: { kind: HostKind } = $props();
</script>

<Feedback />

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
		<Popover.Root open={true}>
			<Popover.Trigger>
				<Button variant="outline">Open details</Button>
			</Popover.Trigger>
			<Popover.Content>
				<div class="popover-body">Overlay content</div>
			</Popover.Content>
		</Popover.Root>
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
