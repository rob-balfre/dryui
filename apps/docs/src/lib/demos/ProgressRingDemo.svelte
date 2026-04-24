<script lang="ts">
	import { ProgressRing } from '@dryui/ui';
</script>

<div class="grid">
	<section class="card">
		<ProgressRing value={82} max={100} color="green" size={72} strokeWidth={6} />
		<div class="meta">
			<p class="title">Build success</p>
			<p class="note">82 of 100 pipelines on main passed in the last 24h.</p>
		</div>
	</section>

	<section class="card">
		<ProgressRing value={47} max={100} color="yellow" size={72} strokeWidth={6} />
		<div class="meta">
			<p class="title">Coverage</p>
			<p class="note">47% of lines covered. 18 modules still below the 70% gate.</p>
		</div>
	</section>

	<section class="card">
		<ProgressRing indeterminate color="primary" size={72} strokeWidth={6} />
		<div class="meta">
			<p class="title">Signing release</p>
			<p class="note">Waiting on the attestation service before the artifact is pushed.</p>
		</div>
	</section>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: var(--dry-space-3);
	}

	.card {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.meta {
		display: grid;
		gap: var(--dry-space-1);
	}
	.title {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}
	.note {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		line-height: 1.4;
	}
</style>
