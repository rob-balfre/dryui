<script lang="ts">
	import { Avatar, Badge, HoverCard } from '@dryui/ui';
</script>

<div class="stage">
	<article class="pr">
		<header class="pr-head">
			<Badge variant="soft" size="sm">Merged</Badge>
			<p class="pr-title">Migrate billing webhooks to v2</p>
		</header>
		<div class="pr-meta">
			#481 closed by <HoverCard.Root>
				<HoverCard.Trigger><span class="mention">@jules</span></HoverCard.Trigger>
				<HoverCard.Content>
					{@render card()}
				</HoverCard.Content>
			</HoverCard.Root>. 3 review comments resolved.
		</div>
	</article>

	<aside class="preview">
		<p class="eyebrow">Hover card preview</p>
		{@render card()}
	</aside>
</div>

{#snippet card()}
	<div class="card">
		<div class="head">
			<Avatar size="md" fallback="JL" status="online" />
			<div class="who">
				<p class="name">Jules Park</p>
				<p class="handle">@jules. Infra team</p>
			</div>
		</div>
		<p class="bio">Owns the billing pipeline. Office hours Thursdays 14:00 UTC.</p>
		<dl class="facts">
			<div>
				<dt>Joined</dt>
				<dd>Mar 2023</dd>
			</div>
			<div>
				<dt>Ships</dt>
				<dd>147 PRs</dd>
			</div>
		</dl>
	</div>
{/snippet}

<style>
	.stage {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: start;
		gap: var(--dry-space-5);
	}

	.pr {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 65%, transparent);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 40%, transparent);
	}

	.pr-head {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--dry-space-3);
		align-items: center;
	}

	.pr-title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.pr-meta {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.6;
	}

	.mention {
		color: var(--dry-color-text-brand);
		font-weight: 500;
		cursor: default;
	}

	.preview {
		display: grid;
		gap: var(--dry-space-2);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.card {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-base);
		min-inline-size: 18em;
		box-shadow: 0 10px 30px -14px rgba(0, 0, 0, 0.5);
	}

	.head {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--dry-space-3);
		align-items: center;
	}

	.who {
		display: grid;
		gap: var(--dry-space-1);
	}

	.name {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.handle {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.bio {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(2, max-content);
		gap: var(--dry-space-1) var(--dry-space-5);
		margin: 0;
	}

	.facts div {
		display: grid;
		gap: 2px;
	}

	.facts dt {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.facts dd {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
</style>
