<script lang="ts">
	import { Badge, InfiniteScroll } from '@dryui/ui';

	type Activity = { id: number; actor: string; verb: string; object: string; when: string };

	const verbs: Array<{ v: string; o: string }> = [
		{ v: 'merged', o: 'pull request #412' },
		{ v: 'commented on', o: 'incident INC-88' },
		{ v: 'deployed', o: 'api to staging' },
		{ v: 'closed', o: 'issue #1207' },
		{ v: 'reviewed', o: 'pull request #410' },
		{ v: 'opened', o: 'pull request #414' }
	];
	const actors: string[] = ['rianne', 'marco', 'priya', 'ada', 'kenji'];

	function makeBatch(start: number, count: number): Activity[] {
		return Array.from({ length: count }, (_, i) => {
			const idx = start + i;
			const v = verbs[idx % verbs.length]!;
			const actor = actors[idx % actors.length]!;
			return {
				id: idx,
				actor,
				verb: v.v,
				object: v.o,
				when: `${Math.max(1, idx)}m ago`
			};
		});
	}

	let items = $state<Activity[]>(makeBatch(1, 15));
	let loading = $state(false);
	let hasMore = $state(true);

	async function loadMore() {
		loading = true;
		await new Promise((r) => setTimeout(r, 600));
		items = [...items, ...makeBatch(items.length + 1, 10)];
		if (items.length >= 55) hasMore = false;
		loading = false;
	}
</script>

<div class="feed">
	<InfiniteScroll onLoadMore={loadMore} {hasMore} {loading}>
		{#each items as event (event.id)}
			<article class="item">
				<div class="avatar" aria-hidden="true">{(event.actor[0] ?? '?').toUpperCase()}</div>
				<div class="body">
					<p class="line">
						<span class="actor">@{event.actor}</span>
						<span class="verb">{event.verb}</span>
						<span class="object">{event.object}</span>
					</p>
					<p class="when">{event.when}</p>
				</div>
			</article>
		{/each}
		{#snippet loadingIndicator()}
			<div class="status"><Badge variant="soft" pulse>Loading</Badge></div>
		{/snippet}
		{#snippet endMessage()}
			<div class="status"><Badge variant="outline" color="gray">Caught up</Badge></div>
		{/snippet}
	</InfiniteScroll>
</div>

<style>
	.feed {
		display: grid;
		block-size: 24rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.item {
		display: grid;
		grid-template-columns: max-content 1fr;
		align-items: start;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3) var(--dry-space-4);
		border-bottom: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 50%, transparent);
	}

	.avatar {
		display: grid;
		place-items: center;
		block-size: var(--dry-space-8);
		aspect-ratio: 1;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-fill-brand) 16%, var(--dry-color-bg-raised));
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		font-weight: 600;
	}

	.body {
		display: grid;
		gap: var(--dry-space-1);
	}

	.line {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		line-height: 1.5;
	}

	.actor {
		font-family: var(--dry-font-mono);
		color: var(--dry-color-text-strong);
	}

	.verb {
		color: var(--dry-color-text-weak);
	}

	.object {
		color: var(--dry-color-text-strong);
	}

	.when {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.status {
		display: grid;
		justify-items: center;
		padding: var(--dry-space-3);
	}
</style>
