<script lang="ts">
	import { NavigationMenu } from '@dryui/ui';
</script>

<NavigationMenu.Root>
	<NavigationMenu.List>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<NavigationMenu.Link href="#">Overview</NavigationMenu.Link>
				<NavigationMenu.Link href="#">Components</NavigationMenu.Link>
				<NavigationMenu.Link href="#">Themes</NavigationMenu.Link>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
			<NavigationMenu.Content>
				<NavigationMenu.Link href="#">Documentation</NavigationMenu.Link>
				<NavigationMenu.Link href="#">Guides</NavigationMenu.Link>
				<NavigationMenu.Link href="#">Changelog</NavigationMenu.Link>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
		<NavigationMenu.Item>
			<NavigationMenu.Link href="#" active>Pricing</NavigationMenu.Link>
		</NavigationMenu.Item>
	</NavigationMenu.List>
</NavigationMenu.Root>
