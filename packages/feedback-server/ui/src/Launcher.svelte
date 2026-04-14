<script lang="ts">
	import { Badge, Button, Card, Container, Heading, Text } from '@dryui/ui';

	interface LaunchTarget {
		description: string;
		href: string;
		key: string;
		label: string;
	}

	function readLaunchUrl(name: string, fallback: string): string {
		if (typeof window === 'undefined') return fallback;

		const value = new URL(window.location.href).searchParams.get(name);
		return value?.trim() ? value : fallback;
	}

	const targets: LaunchTarget[] = [
		{
			key: 'view',
			label: 'View',
			description: 'Open the visual preview route for live component and layout scenes.',
			href: readLaunchUrl('view', 'http://127.0.0.1:5173/view/bench/visual')
		},
		{
			key: 'feedback',
			label: 'Feedback',
			description: 'Inspect the queue, screenshots, and resolution history.',
			href: readLaunchUrl('feedback', 'http://127.0.0.1:4748/ui')
		},
		{
			key: 'docs',
			label: 'Docs',
			description: 'Browse the docs app, component catalog, and setup guides.',
			href: readLaunchUrl('docs', 'http://127.0.0.1:5173/')
		},
		{
			key: 'theme',
			label: 'Theme Wizard',
			description: 'Tune tokens and preview theme changes against the docs app.',
			href: readLaunchUrl('theme', 'http://127.0.0.1:5173/theme-wizard')
		}
	];
</script>

<Container size="full" padding={false}>
	<section class="launcher">
		<header class="hero">
			<div class="hero-copy">
				<Badge variant="soft" color="blue" size="sm">Workbench</Badge>
				<Heading level={1}>Open the local DryUI tools</Heading>
				<Text as="p" color="secondary">
					Jump straight into the preview routes, docs app, theme tooling, or feedback dashboard.
				</Text>
			</div>
		</header>

		<div class="target-grid">
			{#each targets as target (target.key)}
				<Card.Root variant="elevated">
					<Card.Header>
						<div class="target-heading">
							<Heading level={2}>{target.label}</Heading>
							<Badge variant="outline" color="gray" size="sm">Local</Badge>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="target-stack">
							<Text as="p" color="secondary">{target.description}</Text>
							<Text as="p" size="sm" font="mono">{target.href}</Text>
						</div>
					</Card.Content>
					<Card.Footer>
						<Button href={target.href} target="_blank" rel="noreferrer" variant="solid">
							Open {target.label}
						</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	</section>
</Container>

<style>
	.launcher {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
	}

	.hero {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-2) 0;
	}

	.hero-copy {
		display: grid;
		gap: var(--dry-space-2);
	}

	.target-grid {
		display: grid;
		gap: var(--dry-space-4);
	}

	.target-heading {
		display: grid;
		gap: var(--dry-space-2);
	}

	.target-stack {
		display: grid;
		gap: var(--dry-space-2);
	}

	@container (min-width: 42rem) {
		.target-heading {
			grid-template-columns: minmax(0, 1fr) auto;
			align-items: center;
		}
	}

	@container (min-width: 64rem) {
		.target-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
