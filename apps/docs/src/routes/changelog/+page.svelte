<script lang="ts">
	import { Badge, Card, Container, MarkdownRenderer, Separator, Text } from '@dryui/ui';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Changelog — DryUI</title>
</svelte:head>

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="Changelog"
			description="Current package versions, component surface, and pending release notes — generated from the repo state."
		/>

		<!-- Current packages -->
		<div class="stack-lg">
			<DocsSectionIntro id="packages" title="Current packages" />

			<div class="stack-md">
				<Text size="lg" weight="medium">Core</Text>
				<div class="package-grid">
					{#each data.corePackages as pkg (pkg.name)}
						<Card.Root>
							<Card.Content>
								<div class="package-row">
									<div class="package-name">
										<Badge variant="outline" color="gray">{pkg.name}</Badge>
										<Badge variant="soft" color="blue">{pkg.version}</Badge>
									</div>
									<Text size="sm" color="secondary">{pkg.description}</Text>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</div>

			<div class="stack-md">
				<Text size="lg" weight="medium">Companion workspaces</Text>
				<div class="companion-grid">
					{#each data.companionPackages as pkg (pkg.name)}
						<div class="companion-row">
							<Badge variant="outline" color="gray">{pkg.name}</Badge>
							<Badge variant="soft" color="gray">{pkg.version}</Badge>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<Separator />

		<!-- UI surface -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="surface"
				title="Current UI surface"
				description="Export counts and component categories tracked across packages."
			/>

			<div class="surface-stats">
				<Card.Root>
					<Card.Content>
						<div class="stat-row">
							<Text weight="medium">@dryui/ui</Text>
							<Badge variant="soft" color="blue">{data.uiExportCount} exports</Badge>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content>
						<div class="stat-row">
							<Text weight="medium">@dryui/primitives</Text>
							<Badge variant="soft" color="blue">{data.primitivesExportCount} exports</Badge>
						</div>
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Content>
						<div class="stat-row">
							<Text weight="medium">MCP spec</Text>
							<Badge variant="soft" color="blue">{data.specComponentCount} components</Badge>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<div class="stack-md">
				<Text size="lg" weight="medium">Categories</Text>
				<div class="category-grid">
					{#each data.categories as cat (cat.label)}
						<div class="category-row">
							<Text size="sm">{cat.label}</Text>
							<Badge variant="outline" color="gray" size="sm">{cat.count}</Badge>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<Separator />

		<!-- Current defaults -->
		<div class="stack-lg">
			<DocsSectionIntro id="defaults" title="Current defaults" />

			<Card.Root>
				<Card.Content>
					<ul class="defaults-list">
						<li>
							<Text size="sm">Svelte <code>{data.svelteVersion}</code> in the workspace.</Text>
						</li>
						<li>
							<Text size="sm"><code>theme-auto</code> remains the default app/docs theme mode.</Text
							>
						</li>
						<li>
							<Text size="sm"
								><code>@dryui/lint</code> enforces grid-only layout rules and bans inline styles/flexbox
								in scoped component CSS.</Text
							>
						</li>
						<li>
							<Text size="sm"
								>MCP and CLI surfaces stay aligned around planning, lookup, validation, diagnosis,
								and workspace audit workflows.</Text
							>
						</li>
					</ul>
				</Card.Content>
			</Card.Root>
		</div>

		<Separator />

		<!-- Pending changesets -->
		<div class="stack-lg">
			<DocsSectionIntro id="changesets" title="Pending changesets" />

			{#if data.pendingChangesets.length > 0}
				<div class="stack-md">
					{#each data.pendingChangesets as changeset (changeset.name)}
						<Card.Root>
							<Card.Content>
								<div class="stack-sm">
									<Badge variant="outline" color="gray">{changeset.name}</Badge>
									<MarkdownRenderer content={changeset.body} />
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{:else}
				<Text size="sm" color="secondary"
					>No unreleased changesets are currently checked into <code>.changeset/</code>.</Text
				>
			{/if}
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-10);
		padding-bottom: var(--dry-space-8);
	}

	.package-grid {
		display: grid;
		gap: var(--dry-space-3);
	}

	.package-row {
		display: grid;
		gap: var(--dry-space-2);
	}

	.package-name {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}

	.companion-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
		gap: var(--dry-space-3);
	}

	.companion-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.surface-stats {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
		gap: var(--dry-space-3);
	}

	.stat-row {
		display: grid;
		gap: var(--dry-space-2);
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		gap: var(--dry-space-2);
	}

	.category-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.defaults-list {
		display: grid;
		gap: var(--dry-space-3);
		margin: 0;
		padding-left: var(--dry-space-5);
	}

	.defaults-list li {
		line-height: 1.6;
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
	}
</style>
