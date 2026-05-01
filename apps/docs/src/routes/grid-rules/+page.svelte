<script lang="ts">
	import { Card, CodeBlock, Heading, Separator, Text } from '@dryui/ui';
	import { componentLinkResolver } from '$lib/component-links';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';
	import DocsCallout from '$lib/components/DocsCallout.svelte';
	import { CircleCheck } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Layout CSS Rules — DryUI</title>
</svelte:head>

{#snippet codeExample(code: string, language: string)}
	<Card.Root>
		<Card.Content>
			<CodeBlock
				{code}
				{language}
				showCopyButton={true}
				{...language === 'svelte' ? { linkResolver: componentLinkResolver } : {}}
			/>
		</Card.Content>
	</Card.Root>
{/snippet}

<div data-layout="layout-rules-page">
	<div data-layout-area="main">
		<DocsPageHeader
			title="Layout CSS Rules"
			description="DryUI keeps page layout in src/layout.css with data-layout hooks, CSS grid, flex, and container queries. These rules keep layout consistent, responsive, and easy to maintain across your application."
		/>

		<div class="stack-lg">
			<DocsSectionIntro
				id="principles"
				title="Core Principles"
				description="Five rules that govern all layout in DryUI."
			/>

			<ol class="rules-list">
				<li class="rule-item">
					<span class="rule-icon"><CircleCheck size={20} /></span>
					<div class="rule-body">
						<Heading level={4}>Layout.css owns layout</Heading>
						<Text size="sm" color="secondary">
							Page-level <code>display: grid</code>, <code>display: flex</code>, container rules,
							and grid tracks live in <code>src/layout.css</code>, scoped under
							<code>[data-layout]</code>.
						</Text>
					</div>
				</li>

				<li class="rule-item">
					<span class="rule-icon"><CircleCheck size={20} /></span>
					<div class="rule-body">
						<Heading level={4}>Container queries</Heading>
						<Text size="sm" color="secondary">
							Use <code>container-type: inline-size</code> with <code>@container</code> for
							responsive behavior. Never use <code>@media</code> for sizing breakpoints.
						</Text>
					</div>
				</li>

				<li class="rule-item">
					<span class="rule-icon"><CircleCheck size={20} /></span>
					<div class="rule-body">
						<Heading level={4}>Spacing tokens</Heading>
						<Text size="sm" color="secondary">
							Always use <code>--dry-space-*</code> tokens for gap and padding. Never hardcode pixel values
							for spacing.
						</Text>
					</div>
				</li>

				<li class="rule-item">
					<span class="rule-icon"><CircleCheck size={20} /></span>
					<div class="rule-body">
						<Heading level={4}>CSS custom properties</Heading>
						<Text size="sm" color="secondary">
							Expose layout configuration as <code>--var</code> custom properties so consumers can override
							values without touching your CSS.
						</Text>
					</div>
				</li>

				<li class="rule-item">
					<span class="rule-icon"><CircleCheck size={20} /></span>
					<div class="rule-body">
						<Heading level={4}>No component layout CSS</Heading>
						<Text size="sm" color="secondary">
							Page layout does not go in component <code>&lt;style&gt;</code> blocks. No inline
							styles, no <code>style:</code> directives, no <code>:global()</code>, no
							<code>!important</code>.
						</Text>
					</div>
				</li>
			</ol>
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="media-queries"
				title="@media is for preferences only"
				description="The only valid use of @media queries is for user preference detection — never for sizing."
			/>

			{@render codeExample(
				`/* ✅ Correct — user preferences */
@media (prefers-reduced-motion: reduce) {
  .animated { animation: none; }
}

@media (prefers-color-scheme: dark) {
  /* theme adjustments */
}

/* ❌ Wrong — sizing breakpoints */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* ✅ Correct — use @container in src/layout.css */
@container page (min-width: 48rem) {
  [data-layout='card-grid'] {
    grid-template-columns: repeat(3, 1fr);
  }
}`,
				'css'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="responsive-grid"
				title="Responsive Card Grid"
				description="A grid that adapts its column count based on the container width using @container queries."
			/>

			{@render codeExample(
				`<div data-layout="card-grid">
  <Card.Root>...</Card.Root>
  <Card.Root>...</Card.Root>
  <Card.Root>...</Card.Root>
</div>

/* src/layout.css */
[data-layout='card-grid'] {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--dry-space-4);
}

@container page (min-width: 30rem) {
  [data-layout='card-grid'] {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container page (min-width: 48rem) {
  [data-layout='card-grid'] {
    grid-template-columns: repeat(3, 1fr);
  }
}`,
				'svelte'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="auto-fill"
				title="Auto-fill Grid"
				description="When you don't need specific breakpoints, auto-fill with minmax lets the browser decide how many columns fit."
			/>

			{@render codeExample(
				`[data-layout='auto-grid'] {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(15rem, 100%), 1fr));
  gap: var(--dry-space-4);
}`,
				'css'
			)}

			<DocsCallout title="Why min(15rem, 100%)?" variant="info">
				The <code>min()</code> function prevents overflow on very narrow containers. Without it, items
				would overflow when the container is smaller than the minimum card track.
			</DocsCallout>
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="sidebar-layout"
				title="Page Layout with Sidebar"
				description="Use named grid lines or template areas for page-level layout with sidebar, header, and footer."
			/>

			{@render codeExample(
				`[data-layout='docs-shell'] {
  display: grid;
  grid-template-columns: 16rem minmax(0, 1fr);
  grid-template-areas:
    'header header'
    'sidebar main'
    'footer footer';
  min-block-size: 100dvh;
}

[data-layout='docs-shell'] > [data-layout-area='header'] { grid-area: header; }
[data-layout='docs-shell'] > [data-layout-area='sidebar'] { grid-area: sidebar; }
[data-layout='docs-shell'] > [data-layout-area='main'] { grid-area: main; }
[data-layout='docs-shell'] > [data-layout-area='footer'] { grid-area: footer; }`,
				'css'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="centered-content"
				title="Centered Content with Full-bleed"
				description="A three-column grid trick that constrains content width while allowing full-bleed elements to break out."
			/>

			{@render codeExample(
				`[data-layout='content-page'] {
  display: grid;
  grid-template-columns: 1fr minmax(0, 72ch) 1fr;
}

[data-layout='content-page'] > [data-layout-area='main'] {
  grid-column: 2;
}

[data-layout='content-page'] > [data-layout-area='bleed'] {
  grid-column: 1 / -1;
}`,
				'css'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="vertical-stacking"
				title="Vertical Stacking"
				description="Put vertical rhythm in src/layout.css. Use grid for track-based stacks and flex only for one-dimensional page-layout arrangements."
			/>

			{@render codeExample(
				`/* ❌ Don't put page layout in component styles */
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ✅ src/layout.css */
[data-layout='stack'] {
  display: grid;
  gap: var(--dry-space-4);
}`,
				'css'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="spacing-tokens"
				title="Spacing Scale"
				description="Use these tokens for all gap, padding, and margin values."
			/>

			{@render codeExample(
				`--dry-space-1   /* 4px */
--dry-space-2   /* 8px */
--dry-space-3   /* 12px */
--dry-space-4   /* 16px */
--dry-space-5   /* 20px */
--dry-space-6   /* 24px */
--dry-space-8   /* 32px */
--dry-space-10  /* 40px */
--dry-space-12  /* 48px */
--dry-space-16  /* 64px */`,
				'css'
			)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="enforcement"
				title="Lint Enforcement"
				description="These rules are enforced automatically by @dryui/lint — a Svelte preprocessor that runs during dev and build."
			/>

			<DocsCallout title="What gets flagged" variant="warning">
				The linter warns on page-layout grid or flex outside <code>src/layout.css</code>, inline
				style attributes, style: directives, @media sizing queries, :global(), and !important. Fix
				violations at the source — don't suppress them.
			</DocsCallout>
		</div>
	</div>
</div>

<style>
	.rules-list {
		display: grid;
		gap: 0;
		list-style: none;
		padding: 0;
		margin: 0;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		overflow: hidden;
	}

	.rule-item {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--dry-space-4);
		padding: var(--dry-space-5) var(--dry-space-6);
		border-block-end: 1px solid var(--dry-color-stroke-weak);
		align-items: start;
	}

	.rule-item:last-child {
		border-block-end: none;
	}

	.rule-icon {
		color: var(--dry-color-fill-brand);
		padding-block-start: 2px;
	}

	.rule-body {
		display: grid;
		gap: var(--dry-space-1);
	}
</style>
