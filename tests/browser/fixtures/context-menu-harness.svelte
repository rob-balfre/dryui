<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { ContextMenu } from '../../../packages/ui/src/context-menu/index.js';

	let open = $state(false);
	let lastAction = $state('none');

	function recordAction(action: string) {
		lastAction = action;
	}
</script>

<ContextMenu.Root bind:open>
	<ContextMenu.Trigger data-testid="context-menu-trigger" tabindex="0">
		Project tile
	</ContextMenu.Trigger>

	<ContextMenu.Content data-testid="context-menu-content">
		<ContextMenu.Label data-testid="context-menu-label">Actions</ContextMenu.Label>
		<ContextMenu.Group>
			<ContextMenu.Item data-testid="context-menu-item-open" onclick={() => recordAction('open')}>
				Open
			</ContextMenu.Item>
			<ContextMenu.Item
				data-testid="context-menu-item-disabled"
				disabled
				onclick={() => recordAction('disabled')}
			>
				Delete
			</ContextMenu.Item>
		</ContextMenu.Group>
		<ContextMenu.Separator data-testid="context-menu-separator" />
		<ContextMenu.Item data-testid="context-menu-item-share" onclick={() => recordAction('share')}>
			Share
		</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>

<output data-testid="context-menu-open">{String(open)}</output>
<output data-testid="context-menu-last-action">{lastAction}</output>
