<script lang="ts">
	import { Button, VisuallyHidden } from '@dryui/ui';

	type Status = 'idle' | 'saving' | 'saved';

	const STATUS = {
		idle: { chip: 'Idle', live: 'Ready' },
		saving: { chip: 'Saving', live: 'Saving your changes' },
		saved: { chip: 'Saved', live: 'All changes saved' }
	} as const;

	let status = $state<Status>('idle');

	function save() {
		status = 'saving';
		setTimeout(() => (status = 'saved'), 900);
	}
</script>

<div class="row">
	<div class="context">
		<p class="eyebrow">Live region</p>
		<p class="title">Announce save status</p>
		<p class="note">
			Screen readers get a narrated status update without the visible UI shifting. Click save and
			the <code>aria-live</code> region fires a new announcement each transition.
		</p>
	</div>
	<div class="actions">
		<Button
			variant={status === 'saving' ? 'outline' : 'solid'}
			disabled={status === 'saving'}
			onclick={save}
		>
			{status === 'saving' ? 'Saving.' : 'Save changes'}
		</Button>
		<span class="chip" data-status={status}>
			<span class="dot" aria-hidden="true"></span>
			{STATUS[status].chip}
		</span>
	</div>
</div>

<div aria-live="polite" aria-atomic="true">
	<VisuallyHidden>{STATUS[status].live}</VisuallyHidden>
</div>

<style>
	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-5);
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

	.actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.chip {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-1) var(--dry-space-3);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: 999px;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.dot {
		block-size: 0.5em;
		aspect-ratio: 1;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-text-weak) 60%, transparent);
	}

	.chip[data-status='saving'] .dot {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 80%, transparent);
	}

	.chip[data-status='saved'] .dot {
		background: color-mix(in srgb, var(--dry-color-fill-success) 80%, transparent);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
</style>
