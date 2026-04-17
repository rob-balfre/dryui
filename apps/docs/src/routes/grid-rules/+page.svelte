<script lang="ts">
	import { Card, CodeBlock, Container, Heading, Separator, Text } from '@dryui/ui';
	import { componentLinkResolver } from '$lib/component-links';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';
	import DocsCallout from '$lib/components/DocsCallout.svelte';
	import { CircleCheck } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Grid Layout Rules — DryUI</title>
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

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="Grid Layout Rules"
			description="DryUI uses CSS grid for all layout — no flexbox, no layout components. These rules keep layout consistent, responsive, and easy to maintain across your entire application."
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
						<Heading level={4}>Grid only</Heading>
						<Text size="sm" color="secondary">
							Every layout uses <code>display: grid</code>. Never use <code>display: flex</code> or DryUI
							layout components like Grid, Stack, or Flex.
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
						<Heading level={4}>Scoped styles only</Heading>
						<Text size="sm" color="secondary">
							All layout CSS goes in scoped <code>&lt;style&gt;</code> blocks. No inline styles, no
							<code>style:</code>
							directives, no <code>:global()</code>, no
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

/* ✅ Correct — use @container instead */
.grid-wrapper { container-type: inline-size; }

@container (min-width: 768px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
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
				`<div class="cards-wrapper">
  <div class="cards">
    <Card.Root>...</Card.Root>
    <Card.Root>...</Card.Root>
    <Card.Root>...</Card.Root>
  </div>
</div>

<` +
					`style>
  .cards-wrapper {
    container-type: inline-size;
  }

  .cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--dry-space-4);
  }

  @container (min-width: 480px) {
    .cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @container (min-width: 768px) {
    .cards {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</` +
					`style>`,
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
				`.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
  gap: var(--dry-space-4);
}`,
				'css'
			)}

			<DocsCallout title="Why min(240px, 100%)?" variant="info">
				The <code>min()</code> function prevents overflow on very narrow containers. Without it, items
				would overflow when the container is smaller than 240px.
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
				`.layout {
  display: grid;
  grid-template-columns: var(--sidebar-width, 260px) 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100dvh;
}

.header { grid-column: 1 / -1; }
.footer { grid-column: 1 / -1; }`,
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
				`.page {
  display: grid;
  grid-template-columns: 1fr min(var(--content-width, 72ch), 100%) 1fr;
}

.page > * {
  grid-column: 2;
}

.page > .full-bleed {
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
				description="Replace flexbox column layouts with a single-column grid. Use --dry-space-* tokens for consistent vertical rhythm."
			/>

			{@render codeExample(
				`/* ❌ Don't use flexbox */
.stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ✅ Use grid */
.stack {
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
				The linter warns on display: flex, inline style attributes, style: directives, @media sizing
				queries, :global(), and !important. Fix violations at the source — don't suppress them.
			</DocsCallout>
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-10);
	}
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
