<script lang="ts">
	import { Button, CodeBlock, Container, Heading, Text } from '@dryui/ui';
	import { componentLinkResolver } from '$lib/component-links';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import { DRYUI_SKILLS_INSTALL_COMMAND } from '$lib/ai-setup';
	import { withBase } from '$lib/utils';

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

		<section class="stack-md">
			<Heading level={2}>dryui-init: scaffold or wire up</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				Ask your agent to set up DryUI. The init skill works on new SvelteKit apps, existing apps,
				and brownfield repos: it installs <code>@dryui/ui</code>, <code>@dryui/lint</code>, and
				<code>@dryui/feedback</code>, registers the lint preprocessor, sets up themes, and mounts
				the live-feedback widget so visual iteration is wired from the start.
			</Text>
		</section>

		<section class="stack-md">
			<Heading level={2}>dryui: build with components</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				The core skill. Tell your agent what you want and it composes real
				<code>@dryui/ui</code> controls, picking up theming, forms, a11y, and keyboard patterns from the
				skill rules instead of hand-rolling markup.
			</Text>
			<CodeBlock language="svelte" code={componentExample} linkResolver={componentLinkResolver} />
		</section>

		<section class="stack-md">
			<Heading level={2}>dryui-live-feedback: iterate visually</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				Iterate on the running app by drawing on it. The skill boots the feedback dashboard, keeps
				the dev server healthy, and waits for you to annotate. Each drawing, removed marker, or
				labeled component becomes a structured edit your agent applies, then it loops.
			</Text>
		</section>

		<section class="stack-md">
			<Heading level={2}>Manual setup</Heading>
			<Text size="lg" color="secondary" maxMeasure="default">
				If you would rather wire DryUI by hand, install the packages and import the themes once. The
				skills do this for you, but the surface area is small enough to set up manually.
			</Text>
			<CodeBlock code={manualInstallCode} language="bash" />
			<CodeBlock code={themeImportCode} language="svelte" />
		</section>

		<div class="stack-sm">
			<Text size="sm" color="muted" maxMeasure="default">
				Want to see what the components look like? Each one has a focused page with API, demo, and
				accessibility notes.
			</Text>
			<span class="start-component-action">
				<Button variant="solid" color="ink" size="md" href={withBase('/components/button')}>
					Browse components
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
