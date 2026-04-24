<script lang="ts">
	import { Chip } from '@dryui/ui';
</script>

<div class="cluster">
	<section class="row">
		<p class="eyebrow">PR #842 scopes</p>
		<div class="chips">
			<Chip color="blue">api</Chip>
			<Chip color="blue">billing</Chip>
			<Chip color="purple">breaking</Chip>
			<Chip color="orange">needs-migration</Chip>
		</div>
	</section>

	<section class="row">
		<p class="eyebrow">Build matrix</p>
		<div class="chips">
			<Chip variant="outline" color="green">linux</Chip>
			<Chip variant="outline" color="green">macos</Chip>
			<Chip variant="outline" color="red">windows</Chip>
			<Chip variant="outline" color="gray" disabled>freebsd</Chip>
		</div>
	</section>

	<section class="row">
		<p class="eyebrow">Saved filters</p>
		<div class="chips">
			<Chip selected color="blue">Last 24h</Chip>
			<Chip color="gray">Open</Chip>
			<Chip color="gray">Assigned to me</Chip>
		</div>
	</section>
</div>

<style>
	.cluster {
		display: grid;
		gap: var(--dry-space-4);
	}

	.row {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.chips {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}
</style>
