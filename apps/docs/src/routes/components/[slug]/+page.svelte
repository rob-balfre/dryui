<script lang="ts">
	import type { PageProps } from './$types';
	import { Container, Badge, Tabs, Card, CodeBlock, Table, Heading, Text } from '@dryui/ui';
	import PropsTable from '$lib/components/PropsTable.svelte';
	import CssVarsTable from '$lib/components/CssVarsTable.svelte';
	import { componentLinkResolver } from '$lib/component-links';

	import DocsCallout from '$lib/components/DocsCallout.svelte';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';
	import { getComponentDemo } from '$lib/demos/index';
	let { data }: PageProps = $props();
	let name = $derived(data.name);
	let DemoComponent = $derived(getComponentDemo(name));
	let hasRootPart = $derived(data.hasRootPart);
	let parts = $derived(data.parts ? Object.entries(data.parts) : []);
	let partNames = $derived(data.parts ? Object.keys(data.parts) : []);
	let nonRootPartNames = $derived(partNames.filter((partName) => partName !== 'Root'));
</script>

<svelte:head>
	<title>{name} — dryui</title>
</svelte:head>

{#key name}
	<Container>
		<div class="stack-xl">
			<div class="stack-xl">
				<DocsPageHeader title={name} description={data.description} />

				{#if DemoComponent}
					<div class="demo-surface">
						<DemoComponent />
					</div>
				{/if}

				<div class="stack-lg">
					{#if data.kind === 'primitive'}
						<Card.Root>
							<Card.Content>
								<div class="stack-sm">
									<Badge variant="outline" color="gray">Primitive</Badge>
									<Text color="secondary">
										This page documents the headless layer in <code>@dryui/primitives</code>. Any
										structural styling shown in examples is docs-only.
									</Text>
								</div>
							</Card.Content>
						</Card.Root>
					{/if}

					{#if data.a11y.length > 0}
						<DocsCallout title="Accessibility" variant="info">
							<ul class="a11y-list">
								{#each data.a11y as note (note)}
									<li>{note}</li>
								{/each}
							</ul>
						</DocsCallout>
					{/if}

					<Card.Root>
						<Card.Header>
							<div class="stack-sm">
								<Heading level={3}
									>{data.kind === 'primitive'
										? 'Headless quick start'
										: 'Styled quick start'}</Heading
								>
								<Text color="secondary">
									Copy this entrypoint first. It includes the imports required to get the component
									on screen.
								</Text>
							</div>
						</Card.Header>
						<Card.Content>
							<CodeBlock
								code={data.quickStartCode}
								language="svelte"
								showCopyButton={true}
								linkResolver={componentLinkResolver}
							/>
						</Card.Content>
					</Card.Root>

					{#if data.kind === 'ui'}
						<Card.Root>
							<Card.Header>
								<Heading level={3}>Import options</Heading>
							</Card.Header>
							<Card.Content>
								<div class="stack-md">
									<div>
										<p class="import-label">Root package</p>
										<CodeBlock code={data.rootImport} language="ts" />
									</div>
									{#if data.subpathImport}
										<div>
											<p class="import-label">Per-component subpath</p>
											<CodeBlock code={data.subpathImport} language="ts" />
										</div>
									{/if}
								</div>
							</Card.Content>
						</Card.Root>
					{/if}
				</div>
			</div>

			<div class="stack-lg">
				<DocsSectionIntro
					id="api"
					title="API"
					description="Props, CSS variables, and the public data attributes you can target when styling."
				/>

				<Tabs.Root value="props">
					<Tabs.List>
						<Tabs.Trigger value="props">Props</Tabs.Trigger>
						<Tabs.Trigger value="css-vars">CSS Variables</Tabs.Trigger>
						<Tabs.Trigger value="hooks">Styling Hooks</Tabs.Trigger>
					</Tabs.List>

					<Tabs.Content value="props">
						{#if data.compound && data.parts}
							<PropsTable
								parts={parts
									.filter(([, part]) => part.props)
									.map(([partName, part]) => ({
										name: `${name}.${partName}`,
										props: part.props!,
										forwardedProps: part.forwardedProps ?? null
									}))}
							/>
						{:else if data.props}
							<PropsTable
								props={data.props}
								forwardedProps={data.forwardedProps}
								groups={data.groups ?? null}
							/>
						{:else}
							<Text color="secondary">No props documented.</Text>
						{/if}
					</Tabs.Content>

					<Tabs.Content value="css-vars">
						{#if data.cssVars && Object.keys(data.cssVars).length > 0}
							<CssVarsTable vars={data.cssVars} />
						{:else}
							<Text color="secondary">No CSS variables.</Text>
						{/if}
					</Tabs.Content>

					<Tabs.Content value="hooks">
						{#if data.dataAttributes?.length}
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head scope="col">Attribute</Table.Head>
										<Table.Head scope="col">Description</Table.Head>
										<Table.Head scope="col">Values</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each data.dataAttributes as attr (attr.name)}
										<Table.Row>
											<Table.Cell><code>{attr.name}</code></Table.Cell>
											<Table.Cell>{attr.description ?? '—'}</Table.Cell>
											<Table.Cell>
												{#if attr.values?.length}
													<div class="inline-badges">
														{#each attr.values as value (value)}
															<Badge variant="outline" color="gray" size="sm">{value}</Badge>
														{/each}
													</div>
												{:else}
													<Text as="span" color="secondary">—</Text>
												{/if}
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						{:else}
							<Text color="secondary">No data attributes documented.</Text>
						{/if}
					</Tabs.Content>
				</Tabs.Root>
			</div>
		</div>
	</Container>
{/key}

<style>
	.import-label,
	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
	}

	.import-label {
		color: var(--dry-color-text-weak);
		margin: 0 0 var(--dry-space-2);
	}

	.inline-badges {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
		gap: var(--dry-space-2);
	}

	.a11y-list {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
		padding-left: var(--dry-space-5);
		color: var(--dry-color-text-weak);
	}

	.a11y-list li {
		line-height: 1.6;
	}

	.demo-surface {
		padding: var(--dry-space-6);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-base);
	}
</style>
