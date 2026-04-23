<script lang="ts">
	import { Container, CodeBlock, Link, Separator, Table, Tabs, Text } from '@dryui/ui';
	import { dryuiCliCommands } from '$lib/ai-setup';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import DocsSectionIntro from '$lib/components/DocsSectionIntro.svelte';
	import { withBase } from '$lib/utils';

	const oneOffUsage = `bunx @dryui/cli
npx -y @dryui/cli`;

	const commandReference = 'dryui';

	const commandDocs = [
		{
			command: 'dryui',
			description: 'Open the feedback dashboard and local tools in this repository.',
			example: 'dryui'
		},
		...dryuiCliCommands.map((entry) => ({
			command: `dryui ${entry.name}`,
			description: entry.description,
			example: entry.example ?? `dryui ${entry.name}`
		}))
	];
</script>

<svelte:head>
	<title>Tools — DryUI</title>
</svelte:head>

<Container>
	<div class="stack-lg">
		<DocsPageHeader
			title="Tools"
			description="The CLI is the entry point to DryUI. Install it, run dryui, and use check for static validation or rendered visual review."
		/>

		<div class="stack-lg">
			<Tabs.Root value="bun">
				<Tabs.List>
					<Tabs.Trigger value="bun">bun</Tabs.Trigger>
					<Tabs.Trigger value="npm">npm</Tabs.Trigger>
					<Tabs.Trigger value="pnpm">pnpm</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="bun">
					<CodeBlock code="bun install -g @dryui/cli@latest" language="bash" />
				</Tabs.Content>
				<Tabs.Content value="npm">
					<CodeBlock code="npm install -g @dryui/cli@latest" language="bash" />
				</Tabs.Content>
				<Tabs.Content value="pnpm">
					<CodeBlock code="pnpm add -g @dryui/cli@latest" language="bash" />
				</Tabs.Content>
			</Tabs.Root>

			<Text size="sm" color="muted"
				>For one-off usage, skip the global install and run the wizard directly:</Text
			>
			<CodeBlock code={oneOffUsage} language="bash" />
		</div>

		<Separator />

		<div class="stack-lg">
			<DocsSectionIntro
				id="commands"
				title="Use DryUI"
				description="Inside this monorepo, bare dryui opens the feedback dashboard and local tools. Everywhere else, start with dryui, then use the commands below as the default DryUI surface. Use dryui check --visual for screenshots when static checks pass but the page still looks off."
			/>

			<CodeBlock code={commandReference} language="bash" />

			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head scope="col">Command</Table.Head>
						<Table.Head scope="col">What it does</Table.Head>
						<Table.Head scope="col">Example</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each commandDocs as entry (entry.command)}
						<Table.Row>
							<Table.Cell>
								<Text as="span" size="sm"><code>{entry.command}</code></Text>
							</Table.Cell>
							<Table.Cell>
								<Text as="span" color="secondary">{entry.description}</Text>
							</Table.Cell>
							<Table.Cell>
								<Text as="span" size="sm" color="secondary"><code>{entry.example}</code></Text>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>

			<Text size="sm" color="muted">
				Need optional editor integration, theme wiring, or migration help? Continue with
				<Link href={withBase('/getting-started')} underline="always">Getting Started</Link> and
				<Link href={withBase('/migration-guide')} underline="always">Migration Guide</Link>.
			</Text>
		</div>
	</div>
</Container>
