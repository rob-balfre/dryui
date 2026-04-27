<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import { ScrollToTop } from '@dryui/ui';

	let target = $state<HTMLDivElement | undefined>();

	const captureTarget: Attachment<HTMLDivElement> = (node) => {
		target = node;
		node.scrollTop = 160;

		return () => {
			if (target === node) target = undefined;
		};
	};
</script>

<div class="frame">
	<div class="scroll" {@attach captureTarget}>
		<div class="inner">
			<p class="eyebrow">Changelog / 1.4.0</p>
			<p>
				Shipped DataGrid sorting, a new MarkdownRenderer, and tighter keyboard paths across
				Pagination, Tree, and Accordion.
			</p>
			<p>
				Bug fixes: AlertDialog focus trap no longer leaks past close, DatePicker parses
				<code>YYYY-MM-DD</code> reliably on Safari 17, Tooltip respects
				<code>prefers-reduced-motion</code>.
			</p>
			<p>
				Breaking: <code>Card.Root</code>'s <code>raised</code> prop removed. Use
				<code>variant="elevated"</code>. <code>--dry-color-accent</code> removed. Map to
				<code>--dry-color-fill-brand</code>. <code>Tree.Root</code>'s <code>expanded</code> is now
				<code>defaultExpanded</code>.
			</p>
			<p>
				Scroll threshold: 120px. The return button fades in once you scroll past it and hops back to
				the top with smooth behavior. Respects <code>prefers-reduced-motion</code> for an instant jump.
			</p>
			<p>
				DryUI treats ScrollToTop as an affordance, not a viewport garnish. It attaches to any
				scrollable container via the <code>target</code> prop and stays out of view until you need it.
			</p>
		</div>
	</div>

	{#if target}
		<ScrollToTop {target} threshold={120} position="bottom-right" />
	{/if}
</div>

<style>
	.frame {
		position: relative;
		contain: paint;
		block-size: 16rem;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 40%, transparent);
	}

	.scroll {
		block-size: 100%;
		overflow: auto;
		padding: var(--dry-space-5);
	}

	.inner {
		display: grid;
		gap: var(--dry-space-3);
		min-block-size: 38rem;
		padding-right: var(--dry-space-10);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	p {
		margin: 0;
		line-height: 1.6;
		color: var(--dry-color-text-strong);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: 0.92em;
	}
</style>
