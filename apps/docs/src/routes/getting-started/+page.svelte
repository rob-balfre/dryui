<script lang="ts">
	import { Button, CodeBlock, Container, Heading, Text } from '@dryui/ui';
	import { componentLinkResolver } from '$lib/component-links';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import { DRYUI_SKILLS_INSTALL_COMMAND } from '$lib/ai-setup';
	import { withBase } from '$lib/utils';

	const projectSetupCode = `bun add @dryui/ui
bun add -d @dryui/lint
dryui setup`;

	const themeSetupCode = `<!-- src/routes/+layout.svelte -->
<script>
  import '@dryui/ui/themes/default.css';
  import '@dryui/ui/themes/dark.css';
<\/script>`;

	const firstInterfaceCode = `<script>
  import { Button, Field, Input, Label } from '@dryui/ui';
<\/script>

<Field.Root>
  <Label for="project-name">Project name</Label>
  <Input id="project-name" value="DryUI Studio" />
</Field.Root>

<Button variant="solid">Save changes</Button>`;

	const checkCode = `bun run check
bun run build`;
</script>

<svelte:head>
	<title>Getting Started · DryUI</title>
</svelte:head>

<Container>
	<div class="stack-xl">
		<DocsPageHeader
			title="Getting Started"
			description="DryUI gives humans and agents a shared way to build web app interfaces with reusable components, themes, route patterns, and checks that keep the work consistent."
		/>

		<section class="stack-md">
			<Heading level={2}>Install the skill</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				Add DryUI to your coding agent first. The skill gives it the component contracts,
				accessibility rules, theming model, and feedback workflow it should follow when it edits an
				app.
			</Text>
			<CodeBlock code={DRYUI_SKILLS_INSTALL_COMMAND} language="bash" />
		</section>

		<section class="stack-md">
			<Heading level={2}>Wire the app</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				Add the packages explicitly, then use setup only for editor skills, feedback, and optional
				Svelte MCP wiring. App bootstrap is skill-led instead of CLI-detected.
			</Text>
			<CodeBlock code={projectSetupCode} language="bash" />
		</section>

		<section class="stack-md">
			<Heading level={2}>Add the theme</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				DryUI components are token-driven. Import the base themes once, then override semantic
				tokens when your product needs its own look.
			</Text>
			<CodeBlock code={themeSetupCode} language="svelte" />
		</section>

		<section class="stack-md">
			<Heading level={2}>Build with components</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				Compose real controls and surfaces instead of one-off markup. Use the installed skills and
				docs for component contracts, then run the project checks before it ships.
			</Text>
			<CodeBlock language="svelte" code={firstInterfaceCode} linkResolver={componentLinkResolver} />
			<CodeBlock code={checkCode} language="bash" />
		</section>

		<div class="stack-sm">
			<Text size="sm" color="muted" maxMeasure="default">
				Next, start with a concrete component and let DryUI keep the implementation aligned.
			</Text>
			<span class="start-component-action">
				<Button variant="solid" color="ink" size="md" href={withBase('/components/button')}>
					Start with Button
				</Button>
			</span>
		</div>
	</div>
</Container>

<style>
	.start-component-action {
		justify-self: start;
	}
</style>
