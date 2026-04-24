<script lang="ts">
	import { Button, Field, Input, Label, Tooltip } from '@dryui/ui';

	let apiKey = $state('');
</script>

<div class="row">
	<Field.Root>
		<div class="label-row">
			<Label>Project slug</Label>
			<Tooltip.Root>
				<Tooltip.Trigger>
					<Button variant="ghost" size="sm" aria-label="What goes here?">?</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					Used in the URL. Lowercase, hyphens only. Cannot be changed after create.
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
		<Input bind:value={apiKey} placeholder="vercel-bot" />
	</Field.Root>
</div>

<style>
	.row {
		display: grid;
		grid-template-columns: minmax(0, 22em);
	}

	.label-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
	}
</style>
