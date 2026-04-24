<script lang="ts">
	import { AlertDialog, Button } from '@dryui/ui';
</script>

<div class="row">
	<div class="context">
		<p class="eyebrow">Danger zone</p>
		<p class="title">Delete project dryui-studio</p>
		<p class="note">
			Removes every environment, 42 deploys, and cancels the billing subscription. Cannot be undone.
		</p>
	</div>

	<AlertDialog.Root>
		<AlertDialog.Trigger>
			<Button variant="solid" color="danger">Delete project</Button>
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>Delete dryui-studio?</AlertDialog.Header>
			<AlertDialog.Body>
				This permanently removes the project, its 42 deploys, and every API key. Team members will
				lose access immediately.
			</AlertDialog.Body>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Keep project</AlertDialog.Cancel>
				<AlertDialog.Action>Delete forever</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>

<style>
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-5);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.context {
		display: grid;
		gap: var(--dry-space-1);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
</style>
