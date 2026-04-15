<script lang="ts">
	import { Alert, Card, CodeBlock, Container, Heading, Link, Separator, Text } from '@dryui/ui';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';
	import { componentLinkResolver } from '$lib/component-links';
	import { withBase } from '$lib/utils';

	const plannerCode = `<script lang="ts">
  let country = $state('');
  let airport = $state('');

  const airportOptions = $derived(getAirports(country));

  $effect(() => {
    if (!airportOptions.some((option) => option.value === airport)) {
      airport = '';
    }
  });
<\/script>

<div class="planner">
  <Field.Root>
    <Label>Country</Label>
    <Select.Root bind:value={country}>
      <Select.Trigger><Select.Value placeholder="Choose country" /></Select.Trigger>
      <Select.Content>{/* items */}</Select.Content>
    </Select.Root>
  </Field.Root>

  <Field.Root>
    <Label>Airport</Label>
    <Select.Root bind:value={airport} disabled={!country}>
      <Select.Trigger><Select.Value placeholder="Choose airport" /></Select.Trigger>
      <Select.Content>{/* filtered items */}</Select.Content>
    </Select.Root>
  </Field.Root>
</div>

<style>
  .planner {
    display: grid;
    gap: var(--dry-space-4);
  }
</style>`;
</script>

<svelte:head>
	<title>Migration Guide — DryUI</title>
</svelte:head>

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="Migration Guide"
			description="Use DryUI as a presentation and accessibility system, not a workflow engine. Standardize on raw CSS grid, use Container for width, and keep the CLI lookup and validation loop in the process."
		/>

		<div class="stack-lg">
			<DocsSectionIntro
				id="boundary"
				title="What DryUI owns"
				description="DryUI improves consistency, component correctness, and accessibility. It does not remove route complexity, domain orchestration, or state isolation work."
			/>

			<div class="card-grid">
				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Heading level={4}>Presentation system</Heading>
							<Text size="sm" color="secondary">
								Use DryUI for fields, summaries, cards, alerts, transitions, and control semantics.
								Let your route code own session state, planner normalization, and cross-step
								orchestration.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Heading level={4}>One layout rule</Heading>
							<Text size="sm" color="secondary">
								All layout is scoped CSS grid. Use <Link href={withBase('/components/container')}
									>Container</Link
								> for constrained width and <Link href={withBase('/grid-rules')}
									>@container-based layout rules</Link
								> for responsive behavior.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Heading level={4}>Lookup-first workflow</Heading>
							<Text size="sm" color="secondary">
								Start with <code>dryui info</code> or <code>dryui compose</code>, then run
								<code>dryui review</code> or <code>dryui doctor</code> after implementation. If your
								editor exposes DryUI MCP, <code>ask</code> and <code>check</code> mirror the same loop.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="workflow"
				title="Recommended workflow"
				description="The shortest stable path is lookup, implement, validate."
			/>

			<div class="card-grid">
				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Text weight="medium">1. Lookup</Text>
							<Text size="sm" color="secondary">
								Use <Link href={withBase('/tools')}>dryui info</Link> or <code>dryui compose</code>
								to confirm simple vs compound shape, required parts, bindables, and the canonical usage
								snippet. If MCP is available, <code>ask</code> is the equivalent surface.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Text weight="medium">2. Implement</Text>
							<Text size="sm" color="secondary">
								Build the route with raw CSS grid, semantic tokens, and DryUI components for
								controls and stateful surfaces.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Text weight="medium">3. Validate</Text>
							<Text size="sm" color="secondary">
								Run <code>dryui review</code> on components, <code>dryui diagnose</code> on theme
								CSS, or <code>dryui doctor</code> across the workspace so layout drift, compound
								misuse, and accessibility regressions get caught before they spread.
								<code>check</code> is the MCP equivalent.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<Alert variant="info">
				{#snippet title()}No guessing{/snippet}
				{#snippet description()}
					If a component shape is uncertain, stop and look it up. DryUI is strict by design, and the
					lookup cost is lower than backing out a plausible but wrong abstraction.
				{/snippet}
			</Alert>
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="planners"
				title="State-heavy planners"
				description="Dependent-field flows still need disciplined route state. Normalize first, then render DryUI."
			/>

			<Text size="sm" color="secondary">
				This pattern keeps dependent selects honest: when the parent value changes, derived options
				update and stale child selections are cleared. DryUI owns the field surface; your route code
				owns the state transition.
			</Text>

			<CodeBlock code={plannerCode} language="svelte" linkResolver={componentLinkResolver} />
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-10);
	}

	.card-grid {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
