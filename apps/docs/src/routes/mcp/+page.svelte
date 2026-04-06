<script lang="ts">
	import {
		Container,
		Card,
		CodeBlock,
		Badge,
		Heading,
		Separator,
		Tabs,
		Text,
		Link
	} from '@dryui/ui';
	import { aiAgentSetups, dryuiMcpPrompts, dryuiMcpTools } from '$lib/ai-setup';
	import { withBase } from '$lib/utils';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';
	import DocsCallout from '$lib/components/DocsCallout.svelte';

	const reviewChecks = `- Bare compound components (<Card> instead of <Card.Root>)
- Unknown components / invalid props / invalid parts
- Missing accessible labels / accessible wrappers
- Missing theme CSS import warnings (when applicable)`;

	const reviewInput = `// Provide the Svelte source code as code
// Optional: filename, and projectCss with --dry-* overrides
{
  code: "<Svelte source>",
  filename?: "src/components/Button.svelte",
  projectCss?: ":root{--dry-color-...: ...}"
}`;

	const diagnoseChecks = `- Missing required --dry-color-* semantic tokens
- Wrong value types (e.g. length where a color is expected)
- Low contrast / transparency / visibility problems
- Unresolvable var() references and dark/light inconsistencies`;

	const diagnoseInput = `// Provide either raw CSS as css or a file path as path
{
  css?: "<css with --dry-* overrides>",
  path?: "src/themes/custom.css"
}`;
</script>

<svelte:head>
	<title>MCP Server — dryui</title>
</svelte:head>

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="MCP Server"
			description="Let AI agents inspect DryUI components, plan project setup, fetch composed-output source, validate code and theme CSS, and audit workspaces via the Model Context Protocol."
		/>

		<!-- 1. What it is -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="tools"
				title="Tools"
				description="The MCP server exposes these tools to any connected AI agent."
			/>

			<div class="tool-grid">
				{#each dryuiMcpTools as tool (tool.name)}
					<Card.Root>
						<Card.Content>
							<div class="tool-row">
								<Badge variant="outline" color={tool.color}>{tool.name}</Badge>
								<Text size="sm" color="secondary">{tool.description}</Text>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>

			<Text size="lg" weight="medium">Prompts</Text>
			<Text size="sm" color="secondary">
				These prompts wrap the same workflows for clients that prefer prompt-first agent setup.
			</Text>

			<div class="tool-grid">
				{#each dryuiMcpPrompts as prompt (prompt.name)}
					<Card.Root>
						<Card.Content>
							<div class="tool-row">
								<Badge variant="outline" color={prompt.color}>{prompt.name}</Badge>
								<Text size="sm" color="secondary">{prompt.description}</Text>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>

			<DocsCallout title="Current scope" variant="info">
				MCP currently covers lookup, source retrieval, composition guidance, validation, diagnosis,
				project planning, and workspace audit. Keep setup snippets and terminal-first scaffolding in
				the <Link href={withBase('/cli')} underline="always">CLI</Link>, and use the docs pages when
				you want the same workflows in a browsable UI.
			</DocsCallout>
		</div>

		<Separator />

		<!-- 2. Installation -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="installation"
				title="Installation"
				description="Install the MCP server package in your project."
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
				Standardize on one of these primary setups. Each uses the same <code>@dryui/mcp</code> package,
				but the config file path varies by client.
			</Text>

			<Tabs.Root value="codex">
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

							<div class="stack-sm">
								<Heading level={4}>MCP config</Heading>
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

			<DocsCallout title="Other MCP clients" variant="success">
				The docs site standardizes the main setup flow around Codex, Claude Code, and Cursor.
				Windsurf, VS Code/Copilot, Zed, and other MCP clients can still connect to <code
					>@dryui/mcp</code
				> with their client-specific config formats.
			</DocsCallout>
		</div>

		<Separator />

		<!-- 3. Review tool -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="review-tool"
				title="Review tool"
				description="The review tool validates Svelte component source code against the DryUI spec and returns a JSON report of issues (and a summary)."
			/>

			<Text size="lg" weight="medium">Input</Text>
			<CodeBlock language="js" code={reviewInput} />

			<Text size="lg" weight="medium">What it checks</Text>
			<CodeBlock language="text" code={reviewChecks} />

			<DocsCallout title="Why review?" variant="info">
				Review is ideal when an agent needs "is this DryUI-correct?" feedback before generating new
				code.
			</DocsCallout>
		</div>

		<Separator />

		<!-- 4. Diagnose tool -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="diagnose-tool"
				title="Diagnose tool"
				description="The diagnose tool checks DryUI theme CSS for missing tokens, value errors, and contrast/visibility issues."
			/>

			<Text size="lg" weight="medium">Input</Text>
			<CodeBlock language="js" code={diagnoseInput} />

			<Text size="lg" weight="medium">What it checks</Text>
			<CodeBlock language="text" code={diagnoseChecks} />
		</div>

		<Separator />

		<!-- 5. Source browsing -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="source-browsing"
				title="Source browsing"
				description="When you need copyable source rather than validation, use the get tool or the equivalent docs/CLI surfaces."
			/>

			<div class="tool-grid">
				<Card.Root>
					<Card.Content>
						<div class="tool-row">
							<Badge variant="outline" color="blue">setup</Badge>
							<Text size="sm" color="secondary">
								<Link href={withBase('/getting-started')} underline="always">Getting Started</Link> covers
								theme bootstrap, local linking, and SvelteKit form validation patterns.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="tool-row">
							<Badge variant="outline" color="purple">components</Badge>
							<Text size="sm" color="secondary">
								<Link href={withBase('/components')} underline="always">Components</Link> is the detailed
								API surface with props, structure notes, CSS hooks, and examples.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="tool-row">
							<Badge variant="outline" color="green">source-backed outputs</Badge>
							<Text size="sm" color="secondary">
								<code>get</code> returns raw composed-output source for blocks, templates, and
								starter kits.
							</Text>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>

		<Separator />

		<!-- 6. LLM docs -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="llm-docs"
				title="LLM docs"
				description="Pair the MCP server with static LLM endpoints when an agent needs broad DryUI context before it starts calling tools."
			/>

			<div class="tool-grid">
				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<div class="tool-row">
								<Badge variant="outline" color="gray">llms.txt</Badge>
								<Text size="sm" color="secondary"
									>Library overview, setup, and compact component summaries.</Text
								>
							</div>
							<Link href={withBase('/llms.txt')} underline="always">{withBase('/llms.txt')}</Link>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<div class="tool-row">
								<Badge variant="outline" color="blue">llms-components.txt</Badge>
								<Text size="sm" color="secondary"
									>Detailed component imports, props, styling hooks, and example snippets.</Text
								>
							</div>
							<Link href={withBase('/llms-components.txt')} underline="always"
								>{withBase('/llms-components.txt')}</Link
							>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<DocsCallout title="Retrieval before tooling" variant="info">
				Use the static LLM docs to prime an agent with library-wide knowledge, then let MCP handle
				planning, validation, diagnosis, and workspace audit.
			</DocsCallout>
		</div>

		<Separator />

		<!-- 7. Example prompts -->
		<div class="stack-lg">
			<DocsSectionIntro
				id="example-prompts"
				title="Example prompts"
				description="These are prompts you can give to an AI agent that has the dryui MCP server connected. The agent will call the relevant DryUI tools automatically."
			/>

			<div class="tool-grid">
				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Text size="sm" weight="medium"
								><em
									>"Review this Svelte file for DryUI spec compliance and accessibility issues."</em
								></Text
							>
							<Text size="sm" color="secondary"
								>The agent uses the review tool and returns issues with line numbers.</Text
							>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Text size="sm" weight="medium"
								><em
									>"I customized my theme CSS. Diagnose it for missing tokens and contrast
									problems."</em
								></Text
							>
							<Text size="sm" color="secondary"
								>The agent uses the diagnose tool and returns a theme diagnosis report.</Text
							>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Text size="sm" weight="medium"
								><em>"Audit this workspace for DryUI setup, component, and theme issues."</em></Text
							>
							<Text size="sm" color="secondary"
								>The agent uses the doctor or lint tools and returns a structured workspace report.</Text
							>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content>
						<div class="stack-sm">
							<Text size="sm" weight="medium"
								><em
									>"Review my component and also check whether my project theme CSS could make it
									invisible."</em
								></Text
							>
							<Text size="sm" color="secondary"
								>The agent uses review and (when provided) auto-diagnoses projectCss alongside the
								component.</Text
							>
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<DocsCallout title="Works with any MCP client" variant="success">
				Any agent that supports the Model Context Protocol can connect to <code>@dryui/mcp</code> — Claude
				Desktop, Claude Code, Cursor, and others.
			</DocsCallout>
		</div>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-10);
	}

	.tool-grid {
		display: grid;
		gap: var(--dry-space-3);
	}

	.tool-row {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--dry-space-3);
		align-items: center;
	}
</style>
