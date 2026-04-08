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
		Link
	} from '@dryui/ui';
	import DocsPageHeader from '$lib/components/DocsPageHeader.svelte';
	import { componentLinkResolver } from '$lib/component-links';
	import { homeIntroPrompt } from '$lib/home-intro.svelte';
	import { withBase } from '$lib/utils';

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

	const mcpJsonCode = `{
  "mcpServers": {
    "dryui": {
      "type": "stdio",
      "command": "npx",
      "args": ["@dryui/mcp"]
    }
  }
}`;

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
	<title>Getting Started — dryui</title>
</svelte:head>

<Container>
	<div class="page-stack">
		<DocsPageHeader
			title="Getting Started"
			description="Install dryui and render your first component in under a minute."
		/>

		<!-- AI prompt -->
		<section>
			<div class="stack-lg">
				<Text color="secondary">Paste this into your agent of choice.</Text>
				<CodeBlock code={homeIntroPrompt} language="text" />
			</div>
		</section>

		<Separator />

		<!-- 1. Installation -->
		<section>
			<div class="stack-lg">
				<Heading level={2}>Install</Heading>

				<Tabs.Root value="bun">
					<Tabs.List>
						<Tabs.Trigger value="bun">bun</Tabs.Trigger>
						<Tabs.Trigger value="npm">npm</Tabs.Trigger>
						<Tabs.Trigger value="pnpm">pnpm</Tabs.Trigger>
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

				<Alert.Root variant="info">
					<Alert.Title>Why theme-auto?</Alert.Title>
					<Alert.Description>
						<code>theme-auto</code> follows the user's OS preference via
						<code>prefers-color-scheme</code>. Override with <code>data-theme="light"</code> or
						<code>data-theme="dark"</code> when the user explicitly picks a mode.
					</Alert.Description>
				</Alert.Root>
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

		<!-- 4. AI setup -->
		<section>
			<div class="stack-lg">
				<Heading level={2}>AI setup</Heading>
				<Text size="lg" color="secondary">
					Add the MCP server so your editor can look up components, compose layouts, and validate
					usage.
				</Text>

				<Text size="sm" color="muted">Add to <code>.mcp.json</code> in your project root:</Text>
				<CodeBlock language="json" code={mcpJsonCode} />

				<Alert.Root variant="info">
					<Alert.Title>Editor-specific setup</Alert.Title>
					<Alert.Description>
						See the <Link href={withBase('/tools')} underline="always">Tools</Link> page for CLI
						commands, MCP setup, and editor-specific configs.
					</Alert.Description>
				</Alert.Root>
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
									>AI tooling for component lookup, composition, validation, and project planning.</Text
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

	.badge-row {
		display: grid;
		grid-template-columns: auto auto;
		gap: var(--dry-space-2);
		justify-content: start;
	}

</style>
