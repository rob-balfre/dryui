<script lang="ts">
	import { Card, CodeBlock, Container, Separator } from '@dryui/ui';
	import DocsCallout from '$lib/components/DocsCallout.svelte';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';

	const pipelineCode = `1. User brief
2. DESIGN.md identity
3. DryUI lookup/plan
4. make-interfaces-feel-better polish intent pass
5. Implementation
6. Deterministic check
7. Visual review
8. Repair loop`;

	const checkCode = `dryui compose "dashboard shell"
dryui check src/routes/dashboard/+page.svelte
dryui check --visual http://localhost:5173/dashboard`;
</script>

<svelte:head>
	<title>Design Brief Pipeline | DryUI</title>
</svelte:head>

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="Design Brief Pipeline"
			description="A short, visible UI creation loop for agents: clarify intent, preserve identity, verify DryUI contracts, plan polish, build, check, review pixels, and repair."
		/>

		<DocsCallout title="The polish pass is explicit" variant="info">
			<code>make-interfaces-feel-better</code> is a named planning and visual review step. It is not hidden
			taste applied after the fact.
		</DocsCallout>

		<Separator />

		<section class="stack-lg">
			<DocsSectionIntro
				id="pipeline"
				title="Pipeline"
				description="Use the same order for new screens and meaningful redesigns."
			/>

			<Card.Root>
				<Card.Content>
					<CodeBlock code={pipelineCode} language="text" />
				</Card.Content>
			</Card.Root>

			<ol class="ordered-list">
				<li><strong>User brief:</strong> audience, job, domain, density, constraints, success.</li>
				<li>
					<strong>DESIGN.md identity:</strong> read the local identity if present. Google-style
					<code>DESIGN.md</code> is supported, but optional.
				</li>
				<li>
					<strong>DryUI lookup/plan:</strong> confirm components, recipes, contracts, tokens, and accessibility
					before writing.
				</li>
				<li>
					<strong>Polish intent:</strong> name the feel-better details that matter for this screen.
				</li>
				<li><strong>Implementation:</strong> build with DryUI, Svelte 5, grid, and tokens.</li>
				<li>
					<strong>Deterministic check:</strong> run <code>dryui check</code> or MCP
					<code>check</code>.
				</li>
				<li>
					<strong>Visual review:</strong> review rendered pixels against the brief and polish intent.
				</li>
				<li><strong>Repair loop:</strong> fix, check, review, repeat.</li>
			</ol>
		</section>

		<Separator />

		<section class="stack-lg">
			<DocsSectionIntro
				id="precedence"
				title="Precedence"
				description="When instructions collide, resolve them in this order."
			/>

			<ol class="ordered-list">
				<li>User intent and explicit task constraints.</li>
				<li>Local <code>DESIGN.md</code> identity.</li>
				<li>DryUI component contracts, accessibility, and token/theming discipline.</li>
				<li>Official Svelte MCP guidance for Svelte and SvelteKit decisions.</li>
				<li>make-interfaces-feel-better polish rubric.</li>
			</ol>
		</section>

		<Separator />

		<section class="stack-lg">
			<DocsSectionIntro
				id="polish"
				title="Polish Intent"
				description="Keep this pass short. Choose the details that affect the screen instead of applying decoration by habit."
			/>

			<ul class="check-list">
				<li>balanced headings and pretty body wrapping</li>
				<li>concentric radius for nested surfaces</li>
				<li>icon swaps, tabular numbers, and optical button icon alignment</li>
				<li>interactive transitions, staggered entrances, and smaller exits</li>
				<li>shadow treatment for raised surfaces and adaptive media edges</li>
				<li>token consistency for color, radius, shadow, spacing, duration, and easing</li>
			</ul>
		</section>

		<Separator />

		<section class="stack-lg">
			<DocsSectionIntro
				id="commands"
				title="Commands"
				description="Lookup comes before implementation; deterministic and visual checks come after."
			/>

			<Card.Root>
				<Card.Content>
					<CodeBlock code={checkCode} language="bash" />
				</Card.Content>
			</Card.Root>
		</section>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-10);
		padding-bottom: var(--dry-space-12);
	}

	.stack-lg {
		display: grid;
		gap: var(--dry-space-4);
	}

	.ordered-list,
	.check-list {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
		padding-inline-start: var(--dry-space-6);
		color: var(--dry-color-text-subtle);
		line-height: 1.6;
	}

	.ordered-list code {
		color: var(--dry-color-text-strong);
	}
</style>
