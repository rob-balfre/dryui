<script lang="ts">
	import { Card, CodeBlock, Container, Separator, Text } from '@dryui/ui';
	import { componentLinkResolver } from '$lib/component-links';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';
	import CenteredDemo from '$lib/template-demos/CenteredDemo.svelte';
	import SidebarDemo from '$lib/template-demos/SidebarDemo.svelte';
	import StackDemo from '$lib/template-demos/StackDemo.svelte';
	import HolyGrailDemo from '$lib/template-demos/HolyGrailDemo.svelte';
	import SpanDemo from '$lib/template-demos/SpanDemo.svelte';
	import CardGridDemo from '$lib/template-demos/CardGridDemo.svelte';
	import {
		cardGridSnippet,
		centeredSnippet,
		holyGrailSnippet,
		sidebarSnippet,
		spanSnippet,
		stackSnippet
	} from '$lib/template-demos/snippets';

	const intro =
		'Six named presets for the layout grid that cover the layouts from 1linelayouts.com. Pass the template prop instead of authoring template-areas by hand. Each preset still composes with the existing -wide and -xl overrides if you need a different shape at a breakpoint.';
</script>

<svelte:head>
	<title>Layout templates · DryUI</title>
</svelte:head>

{#snippet codeExample(code: string)}
	<Card.Root>
		<Card.Content>
			<CodeBlock
				{code}
				language="svelte"
				showCopyButton={true}
				linkResolver={componentLinkResolver}
			/>
		</Card.Content>
	</Card.Root>
{/snippet}

<Container>
	<div class="page-stack">
		<DocsPageHeader title="Layout templates" description={intro} />

		<div class="stack-lg">
			<DocsSectionIntro
				id="centered"
				title="centered"
				description="Super Centered. Single child, both axes. Auth screens, splash, error pages, single-card empty states."
			/>
			<div class="demo-frame">
				<CenteredDemo />
			</div>
			{@render codeExample(centeredSnippet)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="sidebar"
				title="sidebar"
				description="Sidebar Says. Two columns: aside that shrinks to a percentage of width with a pixel floor, main fills the rest. Knobs: --dry-area-grid-sidebar-min, --dry-area-grid-sidebar-max."
			/>
			<div class="demo-frame">
				<SidebarDemo />
			</div>
			{@render codeExample(sidebarSnippet)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="stack"
				title="stack"
				description="Pancake Stack. Header, main, footer rows with rows: auto 1fr auto. The classic page shell when you have no sidebar."
			/>
			<div class="demo-frame">
				<StackDemo />
			</div>
			{@render codeExample(stackSnippet)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="holy-grail"
				title="holy-grail"
				description="Classic Holy Grail. Full-width masthead and foot, a three-column middle row of nav/main/aside. The historical hard layout, now one prop."
			/>
			<div class="demo-frame demo-frame-tall">
				<HolyGrailDemo />
			</div>
			{@render codeExample(holyGrailSnippet)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="12-span"
				title="12-span"
				description="A familiar 12-column rhythm. Children flow into the columns in order. Use template-areas to span explicitly until per-child column-span is exposed."
			/>
			<div class="demo-frame">
				<SpanDemo />
			</div>
			{@render codeExample(spanSnippet)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="card-grid"
				title="card-grid"
				description="Repeat-auto-fit-minmax (RAM). The browser decides how many columns fit by minimum track width. Knob: --dry-area-grid-min-track (default 16rem)."
			/>
			<div class="demo-frame demo-frame-flow">
				<CardGridDemo />
			</div>
			{@render codeExample(cardGridSnippet)}
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="custom"
				title="When to skip the preset"
				description="Templates cover the common shapes. Reach for hand-authored template-areas when none fit: bespoke dashboards, asymmetric splits, or layouts that swap structure at breakpoints in ways the table can't express."
			/>
			<Text size="sm" color="secondary">
				The preset prop and manual <code>--dry-area-grid-template-areas</code> are mutually
				exclusive at the base layer (preset wins). They compose at the wide and xl tiers, so you can
				use a preset for the base and override only at breakpoints with
				<code>--dry-area-grid-template-areas-wide</code>.
			</Text>
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-10);
	}

	.stack-lg {
		display: grid;
		gap: var(--dry-space-5);
	}

	.demo-frame {
		display: grid;
		block-size: 14rem;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-subtle, var(--dry-color-bg-base));
		overflow: hidden;
	}

	.demo-frame-tall {
		block-size: 18rem;
	}

	.demo-frame-flow {
		block-size: auto;
		min-block-size: 8rem;
		padding: var(--dry-space-3);
	}
</style>
