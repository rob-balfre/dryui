<script lang="ts">
	import {
		Container,
		Card,
		CodeBlock,
		Badge,
		Heading,
		Link,
		Separator,
		Tabs,
		Text
	} from '@dryui/ui';
	import { aiAgentSetups, dryuiCliCommands, dryuiMcpTools } from '$lib/ai-setup';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';
	import DocsCallout from '$lib/components/DocsCallout.svelte';
	import { withBase } from '$lib/utils';

	const setupCommands = ['init', 'detect', 'install'];
	const discoveryCommands = ['list', 'info', 'compose', 'add', 'get'];
	const validationCommands = ['review', 'diagnose', 'doctor', 'lint'];

	function commandsInGroup(names: string[]) {
		return dryuiCliCommands.filter((c) => names.includes(c.name));
	}

	const groups = [
		{ label: 'Setup & planning', names: setupCommands },
		{ label: 'Component discovery', names: discoveryCommands },
		{ label: 'Validation & audit', names: validationCommands }
	] as const;
</script>

<svelte:head>
	<title>Tools — DryUI</title>
</svelte:head>

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="Tools"
			description="A CLI and MCP server for project setup, DryUI discovery, and validation. The MCP surface is collapsed to ask/check, while the CLI stays targeted."
		/>

		<!-- Setup -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="setup"
				title="Setup"
				description="Install the package and configure your editor or agent."
			/>

			<Tabs.Root value="bun">
				<Tabs.List>
					<Tabs.Trigger value="bun">bun</Tabs.Trigger>
					<Tabs.Trigger value="npm">npm</Tabs.Trigger>
					<Tabs.Trigger value="pnpm">pnpm</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="bun">
					<CodeBlock code="bun add @dryui/mcp" language="bash" />
				</Tabs.Content>
				<Tabs.Content value="npm">
					<CodeBlock code="npm install @dryui/mcp" language="bash" />
				</Tabs.Content>
				<Tabs.Content value="pnpm">
					<CodeBlock code="pnpm add @dryui/mcp" language="bash" />
				</Tabs.Content>
			</Tabs.Root>

			<Text size="lg" weight="medium">Agent setup</Text>
			<Text size="sm" color="muted">
				Each setup uses the same <code>@dryui/mcp</code> package. The config file path varies by client.
			</Text>

			<Tabs.Root value="claude-code">
				<Tabs.List>
					{#each aiAgentSetups as agent (agent.id)}
						<Tabs.Trigger value={agent.id}>{agent.label}</Tabs.Trigger>
					{/each}
				</Tabs.List>

				{#each aiAgentSetups as agent (agent.id)}
					<Tabs.Content value={agent.id}>
						<div class="stack-md">
							<Text size="sm" color="muted">{agent.description}</Text>

							{#if agent.skill}
								<div class="stack-sm">
									<Heading level={4}>{agent.skill.title}</Heading>
									<Text size="sm" color="muted">{agent.skill.note}</Text>
									<CodeBlock code={agent.skill.code} language="bash" />
								</div>
							{/if}

							{#if agent.quickSetup}
								<div class="stack-sm">
									<Heading level={4}>{agent.quickSetup.title}</Heading>
									<CodeBlock code={agent.quickSetup.code} language="bash" />
								</div>
							{/if}

							<div class="stack-sm">
								<Heading level={4}>{agent.quickSetup ? 'Manual config' : 'MCP config'}</Heading>
								<Text size="sm" color="muted">{agent.mcp.note}</Text>
								<CodeBlock code={agent.mcp.code} language={agent.mcp.language} />
							</div>

							<DocsCallout title="{agent.label} setup" variant="info">
								{agent.followUp}
							</DocsCallout>
						</div>
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="workflow"
				title="Recommended workflow"
				description="The stable path is lookup first, implementation second, validation third."
			/>

			<div class="item-grid">
				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Text size="lg" weight="medium">Lookup first</Text>
							<Text size="sm" color="secondary">
								Run <code>ask</code> before writing a component so you confirm the right scope:
								component API, recipe guidance, list browsing, or setup state.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Text size="lg" weight="medium">Validate after implementation</Text>
							<Text size="sm" color="secondary">
								Run <code>check</code> on the changed file, theme, directory, or workspace to catch
								layout drift, accessibility issues, and stale guesses early.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<DocsCallout title="Migration workflow" variant="info">
				See the <Link href={withBase('/migration-guide')} underline="always">Migration Guide</Link> for
				the layout baseline and the dependent-field planner pattern.
			</DocsCallout>
		</div>

		<Separator />

		<!-- CLI usage -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="cli"
				title="CLI commands"
				description="Install once with bun install -g @dryui/cli (or npm install -g @dryui/cli), then run the CLI anywhere. Every command outputs TOON (token-optimized, agent-friendly) by default — pass --text for human-readable plain text, --json where supported, or --full to disable truncation."
			/>

			<Card.Root>
				<Card.Content>
					<CodeBlock code="dryui <command> [options]" language="bash" />
				</Card.Content>
			</Card.Root>

			{#each groups as group (group.label)}
				<div class="stack-md">
					<Text size="lg" weight="medium">{group.label}</Text>
					<div class="item-grid">
						{#each commandsInGroup(group.names) as command (command.name)}
							<Card.Root>
								<Card.Content>
									<div class="stack-sm">
										<div class="item-row">
											<Badge variant="outline" color={command.color}>{command.name}</Badge>
											<Text size="sm" color="secondary">{command.description}</Text>
										</div>
										{#if command.example}
											<CodeBlock code={command.example} language="bash" />
										{/if}
									</div>
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<Separator />

		<!-- MCP tools -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="mcp"
				title="MCP tools"
				description="The MCP server now exposes a collapsed two-tool surface to any connected AI agent. All output uses TOON (token-optimized) format with contextual next-step suggestions."
			/>

			<div class="item-grid">
				{#each dryuiMcpTools as tool (tool.name)}
					<Card.Root>
						<Card.Content>
							<div class="item-row">
								<Badge variant="outline" color={tool.color}>{tool.name}</Badge>
								<Text size="sm" color="secondary">{tool.description}</Text>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>

			<DocsCallout title="Works with any MCP client" variant="success">
				Any agent that supports the Model Context Protocol can connect to <code>@dryui/mcp</code> — Claude
				Code, Codex, Cursor, and others.
			</DocsCallout>
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-10);
	}

	.item-grid {
		display: grid;
		gap: var(--dry-space-3);
	}

	.item-row {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--dry-space-3);
		align-items: center;
	}
</style>
