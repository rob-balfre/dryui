<script lang="ts">
	import { Badge, Button, Spotlight } from '@dryui/ui';
</script>

<div class="grid">
	<Spotlight radius={340} intensity={34} color="rgba(96, 165, 250, 0.28)">
		<article class="card card-hero">
			<div class="head">
				<Badge variant="solid" color="blue" size="sm">new</Badge>
				<p class="eyebrow">Changelog 0.35</p>
			</div>
			<p class="title">Drag-and-drop groups</p>
			<p class="body">
				Move items across multiple lists without writing the store code. Groups share a single
				dragover context, so the kanban scenario becomes five lines.
			</p>
			<div class="row">
				<Button variant="solid" size="sm">Read the release</Button>
				<Button variant="ghost" size="sm">Open the demo</Button>
			</div>
		</article>
	</Spotlight>

	<Spotlight radius={240} intensity={28} color="rgba(244, 114, 182, 0.22)">
		<article class="card">
			<p class="eyebrow">Also shipped</p>
			<p class="title">Anchor-positioned popovers</p>
			<p class="body">
				Popover, DropdownMenu, and HoverCard now use <code>position-try</code> fallbacks before JavaScript
				measurement.
			</p>
		</article>
	</Spotlight>

	<Spotlight radius={240} intensity={28} color="rgba(163, 230, 53, 0.22)">
		<article class="card">
			<p class="eyebrow">Also shipped</p>
			<p class="title">Static validator for tokens</p>
			<p class="body">
				<code>dryui check</code> now flags raw hex, non-grid layout, and inline-size without running a
				browser.
			</p>
		</article>
	</Spotlight>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--dry-space-4);
	}

	.card {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-xl);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 42%, transparent);
		min-block-size: 14rem;
	}

	.card-hero {
		min-block-size: 18rem;
	}

	.head,
	.row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
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

	.title {
		margin: 0;
		font-size: var(--dry-text-lg-size);
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--dry-color-text-strong);
	}

	.body {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.55;
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	@container (max-width: 52rem) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
