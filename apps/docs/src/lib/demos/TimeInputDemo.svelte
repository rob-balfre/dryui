<script lang="ts">
	import { TimeInput } from '@dryui/ui';

	let standup = $state('09:30');
	let deployWindow = $state('22:00');
</script>

<div class="rows">
	<section class="row">
		<div class="context">
			<p class="eyebrow">Daily standup</p>
			<p class="note">Mon-Fri, 15 min. Timezone follows the workspace default.</p>
		</div>
		<TimeInput bind:value={standup} name="standup" />
	</section>

	<section class="row">
		<div class="context">
			<p class="eyebrow">Deploy window opens</p>
			<p class="note">Auto-merges pause 30 min before this time.</p>
		</div>
		<TimeInput bind:value={deployWindow} name="deployWindow" step={300} />
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
		gap: var(--dry-space-4);
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
	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
</style>
