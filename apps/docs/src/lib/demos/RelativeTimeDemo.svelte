<script lang="ts">
	import { RelativeTime } from '@dryui/ui';

	const events = [
		{
			id: 'c8f21c',
			sha: '8f21c3e',
			message: 'fix(cli): guard against missing lockfile',
			at: Date.parse('2026-04-22T18:46:00Z')
		},
		{
			id: 'c3b12a',
			sha: '3b12a9d',
			message: 'feat(ui): ship ProgressRing indeterminate mode',
			at: Date.parse('2026-04-21T09:30:00Z')
		},
		{
			id: 'c91f04',
			sha: '91f04bd',
			message: 'chore: bump @dryui/tokens to 1.4.0',
			at: Date.parse('2026-04-19T12:14:00Z')
		},
		{
			id: 'ca207f',
			sha: 'a207fd1',
			message: 'refactor: extract chart axes into primitives',
			at: Date.parse('2026-04-10T08:02:00Z')
		}
	];
</script>

<ul class="feed">
	<p class="eyebrow">main</p>
	{#each events as event (event.id)}
		<li class="row">
			<span class="sha">{event.sha}</span>
			<span class="message">{event.message}</span>
			<span class="when"><RelativeTime date={event.at} /></span>
		</li>
	{/each}
</ul>

<style>
	.feed {
		list-style: none;
		margin: 0;
		padding: var(--dry-space-4) var(--dry-space-5);
		display: grid;
		gap: var(--dry-space-2);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.eyebrow {
		margin: 0 0 var(--dry-space-1);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.row {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: baseline;
		gap: var(--dry-space-3);
	}

	.sha {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}
	.message {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.when {
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}
</style>
