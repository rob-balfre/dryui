<script lang="ts">
	import { Badge } from '@dryui/ui';
</script>

<div class="rows">
	<section class="row">
		<div class="context">
			<p class="eyebrow">Billing</p>
			<p class="title">Pro plan</p>
			<p class="note">Renews May 18. Includes 5 seats and 2M requests per month.</p>
		</div>
		<div class="badges">
			<Badge variant="soft" color="green">Active</Badge>
			<Badge variant="outline" color="gray">Annual</Badge>
		</div>
	</section>

	<section class="row">
		<div class="context">
			<p class="eyebrow">Incident</p>
			<p class="title">INC-2041 payments queue backlog</p>
			<p class="note">Opened 14 min ago. On-call paged. Retries climbing past 3%.</p>
		</div>
		<div class="badges">
			<Badge variant="soft" color="red" pulse>Live</Badge>
			<Badge variant="outline" color="red">Sev 2</Badge>
		</div>
	</section>

	<section class="row">
		<div class="context">
			<p class="eyebrow">Release</p>
			<p class="title">dryui-core@1.4.0-rc.2</p>
			<p class="note">3 reviewers required. Staged against main. Ready for final pass.</p>
		</div>
		<div class="badges">
			<Badge variant="dot" color="orange">Pending</Badge>
			<Badge variant="soft" color="gray">42 commits</Badge>
		</div>
	</section>
</div>

<style>
	.rows {
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

	.badges {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}
</style>
