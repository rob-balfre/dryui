<script lang="ts">
	import {
		Container,
		Card,
		Tabs,
		CodeBlock,
		Badge,
		Separator,
		Alert,
		Heading,
		Text,
		Link,
		Timeline
	} from '@dryui/ui';
	import AgentLogo from '$lib/components/AgentLogo.svelte';
	import PackageManagerLogo from '$lib/components/PackageManagerLogo.svelte';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import { componentLinkResolver } from '$lib/component-links';
	import { aiAgentSetups } from '$lib/ai-setup';
	import { homeIntroPrompts } from '$lib/home-intro.svelte';
	import { withBase } from '$lib/utils';

	const PLUGIN_AGENT_IDS = ['claude-code', 'codex', 'gemini'] as const;

	const featuredAgentSetups = aiAgentSetups.filter((setup) =>
		(PLUGIN_AGENT_IDS as readonly string[]).includes(setup.id)
	);

	const themeImportsCode = `<!-- In your root layout (+layout.svelte) -->
<script>
  import '@dryui/ui/themes/default.css';
  import '@dryui/ui/themes/dark.css';
<\/script>`;

	const appHtmlCode = `<html lang="en" class="theme-auto">
  <body>
    %sveltekit.body%
  </body>
</html>`;

	const buttonCode = `<script>
  import { Button } from '@dryui/ui';
<\/script>

<Button variant="solid" onclick={() => console.log('clicked')}>
  Save changes
</Button>`;

	const cardCode = `<script>
  import { Card, Text } from '@dryui/ui';
<\/script>

<Card.Root>
  <Card.Header>
    <h3>My Card</h3>
  </Card.Header>
  <Card.Content>
    <Text>Card content goes here.</Text>
  </Card.Content>
</Card.Root>`;

	const forcedThemeCode = `<!-- Force dark mode -->
<html data-theme="dark">

<!-- Force light mode -->
<html data-theme="light">`;

	const globalOverridesCode = `:root {
  --dry-color-fill-brand: #8b5cf6;
  --dry-color-fill-brand-hover: #7c3aed;
  --dry-radius-md: 12px;
}`;
</script>

<svelte:head>
	<title>Getting Started — DryUI</title>
</svelte:head>

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="Getting Started"
			description="Install DryUI and render your first component in under a minute."
		/>

		<!-- AI prompt -->
		<section>
			<div class="stack-lg">
				<Tabs.Root value="bun">
					<Tabs.List>
						<Tabs.Trigger value="bun">
							<span class="pm-tab-label"><PackageManagerLogo manager="bun" /> bun</span>
						</Tabs.Trigger>
						<Tabs.Trigger value="npm">
							<span class="pm-tab-label"><PackageManagerLogo manager="npm" /> npm</span>
						</Tabs.Trigger>
						<Tabs.Trigger value="pnpm">
							<span class="pm-tab-label"><PackageManagerLogo manager="pnpm" /> pnpm</span>
						</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="bun">
						<CodeBlock code={homeIntroPrompts.bun} language="text" />
					</Tabs.Content>
					<Tabs.Content value="npm">
						<CodeBlock code={homeIntroPrompts.npm} language="text" />
					</Tabs.Content>
					<Tabs.Content value="pnpm">
						<CodeBlock code={homeIntroPrompts.pnpm} language="text" />
					</Tabs.Content>
				</Tabs.Root>
			</div>
		</section>

		<Separator />

		<section>
			<div class="stack-lg">
				<Heading level={2}>Install the DryUI plugin</Heading>
				<Text size="lg" color="secondary">
					Once <code>dryui</code> is installed, add the DryUI plugin in Claude Code, Codex, or
					Gemini CLI. Each plugin ships the DryUI skill plus the <code>dryui</code> and
					<code>dryui-feedback</code> MCP servers in one step.
				</Text>

				<Tabs.Root value={featuredAgentSetups[0]?.id ?? 'claude-code'}>
					<Tabs.List>
						{#each featuredAgentSetups as setup (setup.id)}
							<Tabs.Trigger value={setup.id}>
								<span class="agent-tab-label">
									<AgentLogo agent={setup.id as 'claude-code' | 'codex' | 'gemini'} size={18} />
									{setup.label}
								</span>
							</Tabs.Trigger>
						{/each}
					</Tabs.List>
					{#each featuredAgentSetups as setup (setup.id)}
						<Tabs.Content value={setup.id}>
							<div class="agent-setup-card">
								<Text color="secondary">{setup.description}</Text>

								{#if setup.installSteps && setup.installSteps.length > 0}
									<Timeline.Root>
										{#each setup.installSteps as step, index (step.title)}
											<Timeline.Item>
												<Timeline.Icon>{index + 1}</Timeline.Icon>
												<Timeline.Content>
													<Timeline.Title level={4}>{step.title}</Timeline.Title>
													{#if step.description}
														<Timeline.Description>{step.description}</Timeline.Description>
													{/if}
													{#if step.code}
														<CodeBlock language="bash" code={step.code} />
													{/if}
												</Timeline.Content>
											</Timeline.Item>
										{/each}
									</Timeline.Root>
								{:else if setup.skill}
									<div class="stack-sm">
										<Text size="sm" color="muted">{setup.skill.title}</Text>
										<Text size="sm" color="secondary">{setup.skill.note}</Text>
										<CodeBlock language="bash" code={setup.skill.code} />
									</div>
								{/if}

								<Text size="sm" color="secondary">{setup.followUp}</Text>
							</div>
						</Tabs.Content>
					{/each}
				</Tabs.Root>

				<Text size="sm" color="muted">
					Using Cursor, Copilot, Windsurf, or Zed? They don't ship a DryUI plugin yet — the full
					setup matrix below covers the MCP-only install for each.
				</Text>
			</div>
		</section>

		<Separator />

		<!-- 1. Installation -->
		<section>
			<div class="stack-lg">
				<Heading level={2}>Install</Heading>

				<Tabs.Root value="bun">
					<Tabs.List>
						<Tabs.Trigger value="bun">
							<span class="pm-tab-label"><PackageManagerLogo manager="bun" /> bun</span>
						</Tabs.Trigger>
						<Tabs.Trigger value="npm">
							<span class="pm-tab-label"><PackageManagerLogo manager="npm" /> npm</span>
						</Tabs.Trigger>
						<Tabs.Trigger value="pnpm">
							<span class="pm-tab-label"><PackageManagerLogo manager="pnpm" /> pnpm</span>
						</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="bun">
						<CodeBlock code="bun add @dryui/ui" language="bash" />
					</Tabs.Content>
					<Tabs.Content value="npm">
						<CodeBlock code="npm install @dryui/ui" language="bash" />
					</Tabs.Content>
					<Tabs.Content value="pnpm">
						<CodeBlock code="pnpm add @dryui/ui" language="bash" />
					</Tabs.Content>
				</Tabs.Root>

				<Text size="sm" color="muted">Headless primitives only (no styles, no dependencies):</Text>
				<CodeBlock code="bun add @dryui/primitives" language="bash" />
			</div>
		</section>

		<Separator />

		<!-- 2. Theme setup -->
		<section>
			<div class="stack-lg">
				<Heading level={2}>Theme setup</Heading>
				<Text size="lg" color="secondary">
					Import the theme CSS and set <code>class="theme-auto"</code> on <code>&lt;html&gt;</code> for
					automatic light/dark switching.
				</Text>

				<CodeBlock language="svelte" code={themeImportsCode} />
				<CodeBlock language="html" code={appHtmlCode} />

				<Alert variant="info">
					{#snippet title()}Why theme-auto?{/snippet}
					{#snippet description()}
						<code>theme-auto</code> follows the user's OS preference via
						<code>prefers-color-scheme</code>. Override with <code>data-theme="light"</code> or
						<code>data-theme="dark"</code> when the user explicitly picks a mode.
					{/snippet}
				</Alert>
			</div>
		</section>

		<Separator />

		<!-- 3. First component -->
		<section>
			<div class="stack-lg">
				<Heading level={2}>First component</Heading>

				<Heading level={3}>Button</Heading>
				<CodeBlock language="svelte" code={buttonCode} linkResolver={componentLinkResolver} />

				<Heading level={3}>Card</Heading>
				<Text size="sm" color="muted"
					>Most components use compound syntax — <code>Card.Root</code>, <code>Card.Header</code>,
					<code>Card.Content</code>.</Text
				>
				<CodeBlock language="svelte" code={cardCode} linkResolver={componentLinkResolver} />
			</div>
		</section>

		<Separator />

		<section>
			<div class="stack-lg">
				<Heading level={2}>Agent workflow</Heading>
				<Text size="lg" color="secondary">
					Start with <code>dryui</code>. Outside the DryUI monorepo it asks which editor or agent
					you want to wire, whether to install the Claude hook, and whether to open feedback. After
					that, use
					<code>dryui init</code> for new apps, <code>dryui install</code> /
					<code>dryui detect</code>
					for existing ones, and <code>dryui info</code> / <code>dryui compose</code> before writing
					component code. After implementation, run <code>dryui review</code>,
					<code>dryui diagnose</code>, or <code>dryui doctor</code> depending on what changed.
				</Text>

				<Alert variant="info">
					{#snippet title()}CLI first, MCP second{/snippet}
					{#snippet description()}
						Use the <Link href={withBase('/tools')} underline="always">Tools</Link> page for CLI setup
						and command details. If your editor supports MCP, <code>ask</code> and
						<code>check</code>
						mirror the same lookup and validation loop in-editor. Use the
						<Link href={withBase('/migration-guide')} underline="always">Migration Guide</Link> for the
						route-level workflow and state-heavy planner pattern.
					{/snippet}
				</Alert>
			</div>
		</section>

		<Separator />

		<!-- 4. Editor integration -->
		<section>
			<div class="stack-lg">
				<Heading level={2}>Full editor setup</Heading>
				<Text size="lg" color="secondary">
					Use the full matrix below if you want the complete per-editor setup, or the manual MCP
					fallback for Claude Code and Codex. The snippets are the same shared setup data that backs
					the CLI and docs.
				</Text>

				<CodeBlock language="bash" code="dryui" />

				<Tabs.Root value="claude-code">
					<Tabs.List>
						{#each aiAgentSetups as setup (setup.id)}
							<Tabs.Trigger value={setup.id}>{setup.label}</Tabs.Trigger>
						{/each}
					</Tabs.List>

					{#each aiAgentSetups as setup (setup.id)}
						<Tabs.Content value={setup.id}>
							<div class="stack-md">
								<Text color="secondary">{setup.description}</Text>

								{#if setup.quickSetup}
									<div class="stack-sm">
										<Text size="sm" color="muted">{setup.quickSetup.title}</Text>
										<CodeBlock language="bash" code={setup.quickSetup.code} />
									</div>
								{/if}

								{#if setup.skill}
									<div class="stack-sm">
										<Text size="sm" color="muted">{setup.skill.title}</Text>
										<Text size="sm" color="secondary">{setup.skill.note}</Text>
										<CodeBlock language="bash" code={setup.skill.code} />
									</div>
								{/if}

								<div class="stack-sm">
									<Text size="sm" color="muted">Manual MCP config</Text>
									<Text size="sm" color="secondary">{setup.mcp.note}</Text>
									<CodeBlock language={setup.mcp.language} code={setup.mcp.code} />
								</div>

								<Alert variant="info">
									{#snippet title()}Follow-up{/snippet}
									{#snippet description()}{setup.followUp}{/snippet}
								</Alert>
							</div>
						</Tabs.Content>
					{/each}
				</Tabs.Root>

				<Alert variant="info">
					{#snippet title()}CLI first, snippets second{/snippet}
					{#snippet description()}
						Use <code>dryui</code> when you want the interactive flow. Use the
						<Link href={withBase('/tools')} underline="always">Tools</Link> page for CLI commands and
						terminal workflows. Use <code>dryui setup</code> if you want the explicit subcommand, or the
						tabs above if you want to wire everything yourself.
					{/snippet}
				</Alert>
			</div>
		</section>

		<Separator />

		<!-- 5. Theming -->
		<section>
			<div class="stack-lg">
				<Heading level={2}>Theming</Heading>
				<Text size="lg" color="secondary">
					Every visual property is a CSS variable. Override globally or per-component.
				</Text>

				<CodeBlock language="css" code={globalOverridesCode} />

				<CodeBlock language="html" code={forcedThemeCode} />

				<div class="stack-sm">
					<Text size="sm" color="muted">
						Use the <Link href={withBase('/theme-wizard')} underline="always">Theme Wizard</Link> to generate
						a full theme from a single brand colour.
					</Text>
				</div>
			</div>
		</section>

		<Separator />

		<!-- 6. Architecture -->
		<section>
			<div class="stack-lg">
				<Heading level={2}>Architecture</Heading>
				<Text size="lg" color="secondary">Three independent layers — adopt at any level.</Text>

				<div class="stack-md">
					<Card.Root>
						<Card.Content>
							<div class="arch-layer">
								<Badge variant="outline" color="blue">@dryui/primitives</Badge>
								<Text size="sm" color="secondary"
									>Headless, unstyled components. Zero dependencies.</Text
								>
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Content>
							<div class="arch-layer">
								<Badge variant="outline" color="purple">@dryui/ui</Badge>
								<Text size="sm" color="secondary"
									>Styled components with CSS-variable theming. Built on primitives.</Text
								>
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Content>
							<div class="arch-layer">
								<div class="badge-row">
									<Badge variant="outline" color="blue">@dryui/cli</Badge>
									<Badge variant="outline" color="green">@dryui/mcp</Badge>
								</div>
								<Text size="sm" color="secondary"
									>CLI-first tooling for setup, lookup, and validation. MCP mirrors
									<code>ask</code> / <code>check</code> inside supported editors.</Text
								>
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		</section>
	</div>
</Container>

<style>
	.page-stack {
		display: grid;
		gap: var(--dry-space-12);
	}

	.arch-layer {
		display: grid;
		gap: var(--dry-space-2);
		justify-items: start;
	}

	.agent-setup-card {
		display: grid;
		gap: var(--dry-space-4);
		--dry-timeline-dot-size: 1.5rem;
	}

	.agent-tab-label,
	.pm-tab-label {
		display: inline-grid;
		grid-template-columns: auto auto;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.badge-row {
		display: grid;
		grid-template-columns: auto auto;
		gap: var(--dry-space-2);
		justify-content: start;
	}
</style>
