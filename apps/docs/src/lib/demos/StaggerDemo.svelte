<script lang="ts">
	import { Button, Enter, Stagger, Text } from '@dryui/ui';

	const commits = [
		{
			hash: '4b21ae9',
			author: 'rob',
			message: 'feat(cli): stream init progress to terminal',
			at: '2m ago'
		},
		{
			hash: 'a8f04c1',
			author: 'ana',
			message: 'fix(Field): validate on blur when async rules exist',
			at: '14m ago'
		},
		{
			hash: '91de34b',
			author: 'jordan',
			message: 'chore: bump impeccable to 0.9.1',
			at: '38m ago'
		},
		{
			hash: '7c30fe8',
			author: 'rob',
			message: 'docs: add effects gallery and calibration bar',
			at: '1h ago'
		}
	];

	let nonce = $state(0);
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Recent commits</p>
		<Text color="secondary" size="sm">
			Stagger applies an nth-child delay so each entrance lifts in sequence. Replay to watch the
			cascade.
		</Text>
	</div>

	{#key nonce}
		<Stagger step="section" class="commits">
			{#each commits as commit, index (commit.hash)}
				<Enter {index}>
					<article class="commit">
						<span class="hash">{commit.hash}</span>
						<span class="message">{commit.message}</span>
						<span class="meta">{commit.author} · {commit.at}</span>
					</article>
				</Enter>
			{/each}
		</Stagger>
	{/key}

	<Button variant="outline" size="sm" onclick={() => (nonce += 1)}>Replay stagger</Button>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
		justify-items: start;
	}

	.head {
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

	.stage :global(.commits) {
		display: grid;
		gap: var(--dry-space-2);
		inline-size: 100%;
	}

	.commit {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3) var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 68%, transparent);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 48%, transparent);
	}

	.hash {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.04em;
		color: var(--dry-color-text-weak);
	}

	.message {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.meta {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}
</style>
