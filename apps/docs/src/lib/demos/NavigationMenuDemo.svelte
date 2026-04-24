<script lang="ts">
	import { Badge, NavigationMenu } from '@dryui/ui';

	const productLinks = [
		{ title: 'Components', note: '200+ primitives, token theming' },
		{ title: 'CLI', note: 'Scaffold, lint, check from your shell' },
		{ title: 'MCP server', note: 'Agent-native validation surface' },
		{ title: 'Live feedback', note: 'Annotate from the running app' }
	];
</script>

<div class="stage">
	<NavigationMenu.Root>
		<NavigationMenu.List>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<div class="panel">
						{#each productLinks as link (link.title)}
							<NavigationMenu.Link>
								<span class="link-row">
									<span class="link-title">{link.title}</span>
									<span class="link-note">{link.note}</span>
								</span>
							</NavigationMenu.Link>
						{/each}
					</div>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>
				<NavigationMenu.Content>
					<div class="panel short">
						<NavigationMenu.Link>Getting started</NavigationMenu.Link>
						<NavigationMenu.Link>Theming</NavigationMenu.Link>
					</div>
				</NavigationMenu.Content>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Link active>Pricing</NavigationMenu.Link>
			</NavigationMenu.Item>
			<NavigationMenu.Item>
				<NavigationMenu.Link>
					<span class="pill">Changelog <Badge variant="soft" size="sm">new</Badge></span>
				</NavigationMenu.Link>
			</NavigationMenu.Item>
		</NavigationMenu.List>
	</NavigationMenu.Root>

	<section class="flyout" aria-label="Product flyout preview">
		<p class="eyebrow">Product flyout preview</p>
		<ul class="grid">
			{#each productLinks as link (link.title)}
				<li>
					<p class="title">{link.title}</p>
					<p class="note">{link.note}</p>
				</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
	}

	.panel {
		display: grid;
		gap: var(--dry-space-2);
		min-inline-size: 22em;
		padding: var(--dry-space-1);
	}

	.short {
		min-inline-size: 14em;
	}

	.link-row {
		display: grid;
		gap: 2px;
	}

	.link-title {
		color: var(--dry-color-text-strong);
		font-weight: 600;
	}

	.link-note {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-text-xs-size);
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

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-3) var(--dry-space-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.title {
		margin: 0 0 2px;
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	@container (max-width: 28rem) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
