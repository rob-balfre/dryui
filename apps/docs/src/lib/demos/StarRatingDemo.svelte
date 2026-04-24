<script lang="ts">
	import { StarRating } from '@dryui/ui';

	const plugins = [
		{ name: 'Cloudflare Tunnel', stars: 5, reviews: 284 },
		{ name: 'Postgres Branching', stars: 4, reviews: 162 },
		{ name: 'OAuth Proxy', stars: 4, reviews: 91 },
		{ name: 'Legacy SMTP Relay', stars: 2, reviews: 38 }
	];
</script>

<div class="panel">
	<p class="eyebrow">Marketplace</p>
	<p class="title">Top add-ons this quarter</p>
	<ul class="list">
		{#each plugins as plugin (plugin.name)}
			<li class="item">
				<span class="name">{plugin.name}</span>
				<StarRating.Root stars={plugin.stars} label={`${plugin.stars} out of 5 stars`} />
				<span class="meta">({plugin.reviews} reviews)</span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4) var(--dry-space-5);
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

	.title {
		margin: 0 0 var(--dry-space-2);
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: var(--dry-space-2);
	}

	.item {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.name {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.meta {
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		font-family: var(--dry-font-mono);
	}
</style>
