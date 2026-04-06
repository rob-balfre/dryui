<script>
	import { CommandPalette, Button, Kbd } from '@dryui/ui';

	let open = $state(false);
</script>

<div class="trigger-row">
	<Button variant="outline" onclick={() => (open = true)}>Open Command Palette</Button>
	<span class="hint">or press <Kbd>Cmd+K</Kbd></span>
</div>

<CommandPalette.Root bind:open>
	<CommandPalette.Input placeholder="Type a command..." />
	<CommandPalette.List>
		<CommandPalette.Group heading="Actions">
			<CommandPalette.Item value="create new file">Create new file</CommandPalette.Item>
			<CommandPalette.Item value="open settings">Open settings</CommandPalette.Item>
		</CommandPalette.Group>
	</CommandPalette.List>
</CommandPalette.Root>

<style>
	.trigger-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.hint {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-text-sm-size);
	}
</style>
