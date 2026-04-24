<script lang="ts">
	import { Toolbar } from '@dryui/ui';
	import {
		Bold,
		Italic,
		Code2,
		Link as LinkIcon,
		List as ListIcon,
		Quote,
		Undo2,
		Redo2
	} from 'lucide-svelte';
</script>

<article class="doc">
	<Toolbar.Root>
		<Toolbar.Button aria-label="Bold" title="Bold">
			<Bold size={16} aria-hidden="true" />
		</Toolbar.Button>
		<Toolbar.Button aria-label="Italic" title="Italic">
			<Italic size={16} aria-hidden="true" />
		</Toolbar.Button>
		<Toolbar.Button aria-label="Inline code" title="Inline code">
			<Code2 size={16} aria-hidden="true" />
		</Toolbar.Button>
		<Toolbar.Separator />
		<Toolbar.Button aria-label="Bulleted list" title="Bulleted list">
			<ListIcon size={16} aria-hidden="true" />
		</Toolbar.Button>
		<Toolbar.Button aria-label="Blockquote" title="Blockquote">
			<Quote size={16} aria-hidden="true" />
		</Toolbar.Button>
		<Toolbar.Separator />
		<Toolbar.Button aria-label="Insert link" title="Insert link">
			<LinkIcon size={16} aria-hidden="true" />
		</Toolbar.Button>
		<Toolbar.Separator />
		<Toolbar.Button aria-label="Undo" title="Undo">
			<Undo2 size={16} aria-hidden="true" />
		</Toolbar.Button>
		<Toolbar.Button aria-label="Redo" title="Redo" disabled>
			<Redo2 size={16} aria-hidden="true" />
		</Toolbar.Button>
	</Toolbar.Root>

	<div class="page">
		<p class="eyebrow">Release notes draft</p>
		<p class="heading">0.35.0 ships Friday</p>
		<p class="para">
			<strong>Three highlights this week.</strong> New DragAndDrop groups keep ordered lists sane
			under heavy DOM diffs. MegaMenu now supports <em>anchor-positioned</em> flyouts on every
			supported browser. And the <code>check</code> tool merges what used to be four commands.
		</p>
		<ul class="bullets">
			<li>DragAndDrop.Group reduces boilerplate for swappable lanes</li>
			<li>NavigationMenu flyouts respect prefers-reduced-motion</li>
			<li>CLI scaffold skips unwritable paths by default</li>
		</ul>
	</div>
</article>

<style>
	.doc {
		display: grid;
		gap: 0;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 65%, transparent);
		border-radius: var(--dry-radius-lg);
		overflow: hidden;
		background: var(--dry-color-bg-base);
	}

	.page {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-5);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.heading {
		margin: 0;
		font-size: var(--dry-text-lg-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.para {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
		line-height: 1.6;
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: 0.92em;
		padding: 0 0.35em;
		border-radius: var(--dry-radius-sm);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 60%, transparent);
	}

	.bullets {
		display: grid;
		gap: var(--dry-space-1);
		margin: 0;
		padding-inline-start: 1.25em;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
		line-height: 1.6;
	}
</style>
