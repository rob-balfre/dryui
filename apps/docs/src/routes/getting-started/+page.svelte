<script lang="ts">
	import { Button, CodeBlock, Container, Heading, Tabs, Text } from '@dryui/ui';
	import { MessageSquareText } from 'lucide-svelte';
	import { componentLinkResolver } from '$lib/component-links';
	import AgentLogo from '$lib/components/AgentLogo.svelte';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import { DRYUI_SKILLS_INSTALL_COMMAND, aiAgentSetups } from '$lib/ai-setup';
	import { withBase } from '$lib/utils';

	const featuredAgentSetups = aiAgentSetups.filter((agent) =>
		['claude-code', 'codex', 'gemini', 'opencode', 'copilot', 'cursor', 'windsurf'].includes(
			agent.id
		)
	);
	let selectedAgent = $state('claude-code');

	function skillPrompt(agentId: string, skillName: string, task?: string) {
		const prefix = agentId === 'codex' ? '$' : '/';
		const command = `${prefix}${skillName}`;
		return task ? `${command} ${task}` : command;
	}

	const skillPrompts = [
		{
			name: 'dryui-init',
			description: 'Set up DryUI in a new or existing SvelteKit app.'
		},
		{
			name: 'dryui-build',
			description: 'Build or edit UI with DryUI components, tokens, and lint rules.',
			task: 'build dashboard'
		},
		{
			name: 'dryui-live-feedback',
			description: 'Open the running app, wait for annotations, then apply each visual edit.'
		}
	];

	const componentExample = `<script>
  import { Button, Field, Input, Label } from '@dryui/ui';
<\/script>

<Field.Root>
  <Label for="project-name">Project name</Label>
  <Input id="project-name" value="DryUI Studio" />
</Field.Root>

<Button variant="solid">Save changes</Button>`;

	const manualInstallCode = `bun add @dryui/ui @dryui/feedback
bun add -d @dryui/lint`;

	const themeImportCode = `<!-- src/routes/+layout.svelte -->
<script>
  import '@dryui/ui/themes/default.css';
  import '@dryui/ui/themes/dark.css';
<\/script>`;
</script>

<svelte:head>
	<title>Getting Started · DryUI</title>
</svelte:head>

<Container>
	<div class="stack-xl">
		<DocsPageHeader
			title="Getting Started"
			description="DryUI is a Svelte 5 component library plus a coding-agent skill set. You drive it by talking to your agent: ask it to scaffold, build, or iterate, and the right skill kicks in."
		/>

		<section class="stack-md">
			<Heading level={2}>Install the skill set</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				One command installs every DryUI skill into your agent. Once installed, the agent picks the
				right skill from each request without you hunting for slash commands.
			</Text>
			<CodeBlock code={DRYUI_SKILLS_INSTALL_COMMAND} language="bash" />
		</section>

		<section class="stack-md" id="agent-setup">
			<Heading level={2}>Use it from your agent</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				Claude Code, Codex, and other coding agents all use the same DryUI skills. Pick your agent
				for the install command, then ask for the skill by name when you want to be explicit.
			</Text>

			<Tabs.Root bind:value={selectedAgent}>
				<Tabs.List>
					{#each featuredAgentSetups as agent (agent.id)}
						<Tabs.Trigger value={agent.id}>
							<span class="agent-tab-label">
								<AgentLogo agent={agent.id} size={18} />
								{agent.label}
							</span>
						</Tabs.Trigger>
					{/each}
				</Tabs.List>

				{#each featuredAgentSetups as agent (agent.id)}
					<Tabs.Content value={agent.id}>
						<div class="agent-tab-panel">
							<div class="stack-md">
								<div class="stack-sm">
									<Heading level={4}>Try these prompts</Heading>
								</div>

								<div class="skill-prompt-list">
									{#each skillPrompts as skill (skill.name)}
										<article class="skill-prompt">
											<CodeBlock
												code={skillPrompt(agent.id, skill.name, skill.task)}
												language="text"
											/>
											<Text size="sm" color="secondary">{skill.description}</Text>
										</article>
									{/each}
								</div>
							</div>

							<Text size="sm" color="muted">{agent.followUp}</Text>
						</div>
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		</section>

		<section class="learn-mode stack-sm">
			<Heading level={4}>Learn more</Heading>
			<Button size="md" href={withBase('/feedback-loop')}>
				<MessageSquareText size={16} aria-hidden="true" />
				Feedback Loop
			</Button>
		</section>
	</div>
</Container>

<style>
	.agent-tab-label {
		display: inline-flex;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.skill-prompt {
		display: grid;
		gap: var(--dry-space-2);
	}

	.agent-tab-panel {
		padding-block-start: var(--dry-space-4);
	}

	.skill-prompt-list {
		display: grid;
		gap: var(--dry-space-4);
		padding-block-start: var(--dry-space-2);
	}

	.learn-mode {
		justify-self: start;
	}
</style>
