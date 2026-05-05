<script lang="ts">
	import { NavigationMenu } from '@dryui/ui';
</script>

<NavigationMenu.Root>
	<NavigationMenu.List>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<div class="panel">
					<NavigationMenu.Link>Components</NavigationMenu.Link>
					<NavigationMenu.Link>CLI</NavigationMenu.Link>
					<NavigationMenu.Link>Themes</NavigationMenu.Link>
				</div>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<div class="panel">
					<NavigationMenu.Link>Getting started</NavigationMenu.Link>
					<NavigationMenu.Link>Theming</NavigationMenu.Link>
				</div>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
		<NavigationMenu.Item>
			<NavigationMenu.Link active>Pricing</NavigationMenu.Link>
		</NavigationMenu.Item>
	</NavigationMenu.List>
</NavigationMenu.Root>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-2);
		min-inline-size: 14em;
		padding: var(--dry-space-2);
	}
</style>
