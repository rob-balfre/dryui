<script lang="ts">
	import { Container, Card, CodeBlock, Badge, Separator, Text, Link } from '@dryui/ui';
	import { dryuiCliCommands } from '$lib/ai-setup';
	import { withBase } from '$lib/utils';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';
	import DocsCallout from '$lib/components/DocsCallout.svelte';

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
	<title>CLI — dryui</title>
</svelte:head>

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="CLI"
			description="A command-line interface for project setup, component lookup, composition guidance, code validation, and workspace auditing. Plain-text output that works for both humans and AI agents."
		/>

		<!-- Usage -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="usage"
				title="Usage"
				description="Run via bunx in any project, or from a repo checkout after building."
			/>

			<div class="stack-md">
				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<div class="badge-row">
								<Badge variant="outline" color="blue">npx / bunx</Badge>
							</div>
							<CodeBlock code="bunx @dryui/cli <command> [options]" language="bash" />
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<div class="badge-row">
								<Badge variant="outline" color="gray">from checkout</Badge>
							</div>
							<CodeBlock
								code={`bun run --filter '@dryui/cli' build\nnode packages/cli/dist/index.js <command> [options]`}
								language="bash"
							/>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<Text size="sm" color="secondary">
				All commands support <code>--help</code> for full usage details. Most accept
				<code>--json</code> for machine-readable output.
			</Text>
		</div>

		<Separator />

		<!-- Command reference -->
		<div class="stack-lg">
			<DocsSectionIntro id="commands" title="Commands" />

			{#each groups as group}
				<div class="stack-md">
					<Text size="lg" weight="medium">{group.label}</Text>
					<div class="command-grid">
						{#each commandsInGroup(group.names) as command (command.name)}
							<Card.Root>
								<Card.Content>
									<div class="stack-sm">
										<div class="command-header">
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

		<!-- CLI vs MCP -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="cli-vs-mcp"
				title="CLI vs MCP"
				description="The CLI and MCP server share the same underlying tools. Use the CLI for terminal workflows and CI pipelines. Use MCP when you want the same capabilities inside an AI agent session."
			/>

			<DocsCallout title="Related pages" variant="info">
				<Link href={withBase('/getting-started')} underline="always">Getting Started</Link> covers theme
				setup and skill installation.
				<Link href={withBase('/mcp')} underline="always">MCP Server</Link> covers agent-specific configuration
				for Claude Code, Codex, and Cursor.
			</DocsCallout>
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-10);
	}

	.command-grid {
		display: grid;
		gap: var(--dry-space-3);
	}

	.badge-row {
		justify-self: start;
	}

	.command-header {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--dry-space-3);
		align-items: center;
	}
</style>
