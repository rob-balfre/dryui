<script lang="ts">
	import { Rating, Field, Label } from '@dryui/ui';

	let docsScore = $state(4);
	let supportScore = $state(4.5);
</script>

<div class="panel">
	<div class="row">
		<div class="context">
			<p class="eyebrow">Survey</p>
			<p class="title">Was this doc page helpful?</p>
			<p class="note">Optional. Your answer informs next week's docs sprint.</p>
		</div>
		<Field.Root>
			<Label>Helpfulness</Label>
			<Rating bind:value={docsScore} max={5} />
		</Field.Root>
	</div>

	<div class="row">
		<div class="context">
			<p class="eyebrow">Ticket INC-9841</p>
			<p class="title">Rate your support conversation</p>
			<p class="note">Half-stars let you mark borderline responses without inflating scores.</p>
		</div>
		<Field.Root>
			<Label>Agent rating</Label>
			<Rating bind:value={supportScore} max={5} allowHalf />
		</Field.Root>
	</div>
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-3);
	}

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
