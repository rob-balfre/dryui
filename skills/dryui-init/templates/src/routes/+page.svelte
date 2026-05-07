<script lang="ts">
	import { Button } from '@dryui/ui/button';
	import { Heading } from '@dryui/ui/heading';
	import { List } from '@dryui/ui/list';
	import { Text } from '@dryui/ui/text';
	import { Typography } from '@dryui/ui/typography';
</script>

<svelte:head>
	<title>DryUI is wired up</title>
</svelte:head>

<main data-layout="home">
	<section data-layout-area="intro">
		<Text as="p" size="xs" font="mono" weight="bold" color="muted">DRYUI</Text>
		<Heading level={1} variant="display">DryUI is wired up.</Heading>
		<Text as="p" size="lg" color="muted">
			You build with DryUI by talking to your coding agent. Three skills cover the loop:
		</Text>
		<div class="skills" data-layout-area="skills">
			<List.Root disablePadding>
				<List.Item>
					<List.ItemText>
						<Typography.Code>dryui</Typography.Code>: components, themes, and a11y patterns for
						building interfaces.
					</List.ItemText>
				</List.Item>
				<List.Item>
					<List.ItemText>
						<Typography.Code>dryui-live-feedback</Typography.Code>: draw on the running app and let
						agents apply each fix.
					</List.ItemText>
				</List.Item>
				<List.Item>
					<List.ItemText>
						<Typography.Code>dryui-init</Typography.Code>: bootstrap or refresh DryUI in any
						SvelteKit project.
					</List.ItemText>
				</List.Item>
			</List.Root>
		</div>
		<Button
			variant="solid"
			color="ink"
			href="https://dryui.dev/getting-started"
			target="_blank"
			rel="noopener noreferrer"
		>
			Read the docs
		</Button>
	</section>
</main>

<style>
	.skills {
		--dry-list-gap: var(--dry-space-1);
		--dry-list-item-padding: 0;
		--dry-list-primary-size: 1rem;

		color: var(--dry-color-text-weak);
	}
</style>
