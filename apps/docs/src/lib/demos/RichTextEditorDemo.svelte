<script lang="ts">
	import { Button, RichTextEditor } from '@dryui/ui';

	let value = $state(
		`<p><strong>Update at 09:18 UTC.</strong> us-east-1 runner pool recovered. Promoting the hotfix to production now.</p><p>Rollback window remains open for 30 minutes. Ping <code>#sev-rooms</code> if anything regresses.</p>`
	);
</script>

<div class="composer">
	<div class="head">
		<p class="eyebrow">Incident INC-88 / Comment</p>
	</div>
	<RichTextEditor.Root bind:value placeholder="Write an update...">
		<RichTextEditor.Toolbar>
			{#snippet children()}{/snippet}
		</RichTextEditor.Toolbar>
		<RichTextEditor.Content />
	</RichTextEditor.Root>
	<div class="actions">
		<p class="hint">Supports <code>**bold**</code>, headings, lists, code, and links.</p>
		<div class="buttons">
			<Button variant="ghost" size="sm">Save draft</Button>
			<Button variant="solid" size="sm">Post update</Button>
		</div>
	</div>
</div>

<style>
	.composer {
		display: grid;
		gap: var(--dry-space-3);
	}

	.head {
		display: grid;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.actions {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.hint {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.hint code {
		font-family: var(--dry-font-mono);
	}

	.buttons {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}
</style>
