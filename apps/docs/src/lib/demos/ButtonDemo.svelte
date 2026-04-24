<script lang="ts">
	import { Button } from '@dryui/ui';
</script>

<div class="scenarios">
	<section class="row">
		<div class="context">
			<p class="eyebrow">Ready to ship</p>
			<p class="title">Release 1.4.0</p>
			<p class="note">3 commits since the last tag. Changelog is up to date.</p>
		</div>
		<div class="actions">
			<Button variant="ghost">Save as draft</Button>
			<Button variant="solid">Publish release</Button>
		</div>
	</section>

	<section class="row">
		<div class="context">
			<p class="eyebrow">Careful</p>
			<p class="title">Revert to 1.3.7</p>
			<p class="note">Staging rolls back to the previous tag. Cannot be undone.</p>
		</div>
		<div class="actions">
			<Button variant="outline">Cancel</Button>
			<Button variant="solid" color="danger">Roll back</Button>
		</div>
	</section>
</div>

<style>
	.scenarios {
		container-type: inline-size;
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

	.actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}

	@container (max-width: 34rem) {
		.row {
			grid-template-columns: minmax(0, 1fr);
		}

		.actions {
			justify-content: end;
		}
	}
</style>
