<script lang="ts">
	import { Badge, MegaMenu } from '@dryui/ui';

	const columns = [
		{
			title: 'Build',
			links: [
				{ name: 'Components', desc: '200+ composable primitives' },
				{ name: 'Themes', desc: 'Token-first theming' },
				{ name: 'CLI', desc: 'Scaffold, lint, check' },
				{ name: 'Icons', desc: 'Tree-shakable icon set' }
			]
		},
		{
			title: 'Ship',
			links: [
				{ name: 'Live feedback', desc: 'Annotate from the running app' },
				{ name: 'MCP server', desc: 'Agent-native validation' },
				{ name: 'Editor plugins', desc: 'Claude, Codex, Cursor' },
				{ name: 'Preview URLs', desc: 'Share work-in-progress' }
			]
		},
		{
			title: 'Learn',
			links: [
				{ name: 'Documentation', desc: 'Guides and API reference' },
				{ name: 'Patterns', desc: 'Real product recipes' },
				{ name: 'Changelog', desc: "What's new this week" },
				{ name: 'Community', desc: 'Discord and office hours' }
			]
		}
	];
</script>

<div class="stage">
	<nav class="bar">
		<MegaMenu.Root>
			<MegaMenu.Item>
				<MegaMenu.Trigger>Platform</MegaMenu.Trigger>
				<MegaMenu.Panel>
					{#each columns as column (column.title)}
						<MegaMenu.Column title={column.title}>
							{#each column.links as link (link.name)}
								<MegaMenu.Link href="#{link.name.toLowerCase().replace(/\s+/g, '-')}">
									{#snippet description()}{link.desc}{/snippet}
									{link.name}
								</MegaMenu.Link>
							{/each}
						</MegaMenu.Column>
					{/each}
				</MegaMenu.Panel>
			</MegaMenu.Item>
			<MegaMenu.Item>
				<MegaMenu.Trigger>Solutions</MegaMenu.Trigger>
				<MegaMenu.Panel>
					<MegaMenu.Column title="By team">
						<MegaMenu.Link href="#platform">Platform</MegaMenu.Link>
					</MegaMenu.Column>
				</MegaMenu.Panel>
			</MegaMenu.Item>
			<MegaMenu.Item>
				<MegaMenu.Trigger>Pricing</MegaMenu.Trigger>
				<MegaMenu.Panel>
					<MegaMenu.Column title="Plans">
						<MegaMenu.Link href="#team">Team</MegaMenu.Link>
					</MegaMenu.Column>
				</MegaMenu.Panel>
			</MegaMenu.Item>
			<MegaMenu.Item>
				<MegaMenu.Trigger>
					<span class="pill">Changelog <Badge variant="soft" size="sm">new</Badge></span>
				</MegaMenu.Trigger>
				<MegaMenu.Panel>
					<MegaMenu.Column title="This week">
						<MegaMenu.Link href="#v035">0.35.0</MegaMenu.Link>
					</MegaMenu.Column>
				</MegaMenu.Panel>
			</MegaMenu.Item>
		</MegaMenu.Root>
	</nav>

	<section class="flyout" aria-label="Platform flyout preview">
		<p class="eyebrow">Platform flyout preview</p>
		<div class="cols">
			{#each columns as column (column.title)}
				<div class="col">
					<p class="col-title">{column.title}</p>
					<ul>
						{#each column.links as link (link.name)}
							<li>
								<p class="link-name">{link.name}</p>
								<p class="link-desc">{link.desc}</p>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-5);
	}

	.bar {
		display: grid;
	}

	.pill {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.flyout {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border-radius: var(--dry-radius-lg);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 65%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 40%, transparent);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.cols {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-5);
	}

	.col-title {
		margin: 0 0 var(--dry-space-2);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	ul {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.link-name {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.link-desc {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	@container (max-width: 36rem) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
