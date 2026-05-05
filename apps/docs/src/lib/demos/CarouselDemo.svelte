<script lang="ts">
	import { Badge, Carousel } from '@dryui/ui';

	const releases = [
		{
			id: 'v035',
			tag: '0.35.0',
			date: '24 Apr 2026',
			title: 'Drag-and-drop groups',
			body: 'Move items across multiple lists from one shared context. The kanban scenario becomes five lines of props.',
			highlights: ['Group onMove handler', 'Per-list bind:items', 'Zero new dependencies']
		},
		{
			id: 'v034',
			tag: '0.34.0',
			date: '17 Apr 2026',
			title: 'Anchor-positioned popovers',
			body: 'Popover, DropdownMenu, and HoverCard now use position-try fallbacks before JavaScript measurement.',
			highlights: ['Native anchor positioning', 'CSS-first placement', 'Smaller runtime']
		},
		{
			id: 'v033',
			tag: '0.33.0',
			date: '10 Apr 2026',
			title: 'Lint contracts',
			body: '@dryui/lint flags raw hex, non-grid layout, and inline-size during package checks.',
			highlights: ['Svelte preprocessor', 'No render pass', 'Package-owned checks']
		}
	];
</script>

<Carousel.Root loop>
	<Carousel.Viewport>
		{#each releases as release (release.id)}
			<Carousel.Slide>
				<article class="slide">
					<div class="head">
						<Badge variant="soft" size="sm">{release.tag}</Badge>
						<p class="date">{release.date}</p>
					</div>

					<div class="copy">
						<p class="title">{release.title}</p>
						<p class="body">{release.body}</p>
					</div>

					<ul class="highlights" aria-label="Release highlights">
						{#each release.highlights as item (item)}
							<li>{item}</li>
						{/each}
					</ul>
				</article>
			</Carousel.Slide>
		{/each}
	</Carousel.Viewport>

	<div class="controls">
		<div class="nav">
			<Carousel.Prev />
			<Carousel.Next />
		</div>
		<Carousel.Dots />
	</div>
</Carousel.Root>

<style>
	.slide {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-5) var(--dry-space-6);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-xl);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 42%, transparent);
		min-block-size: 14rem;
		align-content: start;
	}

	.head {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
	}

	.date {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.copy {
		display: grid;
		gap: var(--dry-space-2);
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-xl-size);
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--dry-color-text-strong);
	}

	.body {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.55;
	}

	.highlights {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.highlights li {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--dry-space-2);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.highlights li::before {
		content: '';
		margin-block-start: 0.55em;
		block-size: 0.35em;
		aspect-ratio: 1;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-fill-brand) 80%, transparent);
	}

	.controls {
		display: grid;
		justify-items: center;
		gap: var(--dry-space-2);
		margin-block-start: var(--dry-space-4);
	}

	.nav {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}
</style>
