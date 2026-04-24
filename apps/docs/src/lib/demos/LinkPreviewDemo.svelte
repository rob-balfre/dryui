<script lang="ts">
	import { Badge, LinkPreview } from '@dryui/ui';
</script>

<div class="stage">
	<article class="note">
		<p class="eyebrow">Release notes</p>
		<p class="title">Animation primitives merged into 0.35.0</p>
		<div class="body">
			Built on top of <LinkPreview.Root>
				<LinkPreview.Trigger
					href="https://github.com/sveltejs/svelte"
					rel="noopener"
					target="_blank"
				>
					github.com/sveltejs/svelte
				</LinkPreview.Trigger>
				<LinkPreview.Content>
					<p>Preview card content</p>
				</LinkPreview.Content>
			</LinkPreview.Root>. Runtime has stayed small.
		</div>
	</article>

	<aside class="preview" aria-label="Link preview card">
		<header class="head">
			<span class="avatar" aria-hidden="true">SV</span>
			<div class="who">
				<p class="path">sveltejs / svelte</p>
				<Badge variant="soft" size="sm">Public</Badge>
			</div>
		</header>
		<p class="desc">Web development for the rest of us. Cybernetically enhanced web apps.</p>
		<dl class="stats">
			<div>
				<dt>Language</dt>
				<dd><span class="dot"></span>TypeScript</dd>
			</div>
			<div>
				<dt>Stars</dt>
				<dd>79.4k</dd>
			</div>
			<div>
				<dt>Updated</dt>
				<dd>2h ago</dd>
			</div>
		</dl>
	</aside>
</div>

<style>
	.stage {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--dry-space-5);
		align-items: start;
	}

	.note {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 65%, transparent);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 40%, transparent);
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

	.body {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
		line-height: 1.6;
	}

	.preview {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border-radius: var(--dry-radius-lg);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 70%, transparent);
		box-shadow: 0 18px 40px color-mix(in srgb, var(--dry-color-shadow) 35%, transparent);
	}

	.head {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--dry-space-3);
		align-items: center;
	}

	.avatar {
		display: grid;
		place-items: center;
		block-size: 2.25em;
		aspect-ratio: 1;
		border-radius: 999px;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-strong);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 26%, transparent);
	}

	.who {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.path {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.desc {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, max-content));
		gap: var(--dry-space-1) var(--dry-space-5);
		margin: 0;
	}

	.stats div {
		display: grid;
		gap: 2px;
	}

	.stats dt {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.stats dd {
		margin: 0;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.dot {
		display: block;
		block-size: 0.55em;
		aspect-ratio: 1;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-fill-brand) 70%, transparent);
	}
</style>
