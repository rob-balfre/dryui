<script lang="ts">
	import { Button, Spinner } from '@dryui/ui';

	let deploying = $state(false);

	function startDeploy() {
		deploying = true;
		setTimeout(() => (deploying = false), 2600);
	}
</script>

<div class="stack">
	<div class="row">
		<div class="context">
			<p class="eyebrow">Inline feedback</p>
			<p class="title">Ship to production</p>
			<p class="note">Spinner sits inside the button so the request still feels tethered.</p>
		</div>
		<Button variant="solid" disabled={deploying} onclick={startDeploy}>
			{#if deploying}
				<span class="btn-body"
					><Spinner size="sm" color="current" label="Deploying" /> Deploying</span
				>
			{:else}
				Deploy main
			{/if}
		</Button>
	</div>

	<div class="page">
		<Spinner size="lg" label="Loading usage" />
		<p class="page-note">Loading usage for last 30 days</p>
	</div>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-4);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-4);
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

	.btn-body {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.page {
		display: grid;
		justify-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-6);
		border: 1px dashed color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-md);
	}

	.page-note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}
</style>
