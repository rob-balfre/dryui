<script lang="ts">
	import { Button, Checkbox, Popover, Separator } from '@dryui/ui';

	let cols = $state({ status: true, owner: true, env: false, build: true, sha: false });
</script>

<div class="stage">
	<div class="context">
		<p class="eyebrow">Deploys table</p>
		<p class="title">Column filter</p>
		<p class="note">Pick which columns render for your next export.</p>
		<Popover.Root>
			<Popover.Trigger>
				<Button variant="outline">Columns</Button>
			</Popover.Trigger>
			<Popover.Content placement="bottom-end">
				<p>Open the popover to choose visible columns.</p>
			</Popover.Content>
		</Popover.Root>
	</div>

	<section class="panel" aria-label="Columns popover preview">
		<p class="panel-heading">Visible columns</p>
		<Separator />
		<div class="rows">
			<Checkbox bind:checked={cols.status}>Status</Checkbox>
			<Checkbox bind:checked={cols.owner}>Owner</Checkbox>
			<Checkbox bind:checked={cols.env}>Environment</Checkbox>
			<Checkbox bind:checked={cols.build}>Build time</Checkbox>
			<Checkbox bind:checked={cols.sha}>Commit SHA</Checkbox>
		</div>
		<Separator />
		<div class="footer">
			<Button variant="ghost" size="sm">Reset</Button>
			<Button variant="solid" size="sm">Apply</Button>
		</div>
	</section>
</div>

<style>
	.stage {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		gap: var(--dry-space-5);
		align-items: start;
	}

	.context {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: start;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.title,
	.panel-heading {
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

	.panel {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		min-inline-size: 16em;
		border-radius: var(--dry-radius-lg);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 70%, transparent);
		box-shadow: 0 18px 40px color-mix(in srgb, var(--dry-color-text-strong) 35%, transparent);
	}

	.rows {
		display: grid;
		gap: var(--dry-space-2);
	}

	.footer {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: end;
		gap: var(--dry-space-2);
	}
</style>
