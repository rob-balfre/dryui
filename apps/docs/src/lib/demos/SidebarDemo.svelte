<script lang="ts">
	import { Sidebar } from '@dryui/ui';
</script>

<div class="demo-layout">
	<Sidebar.Root>
		<Sidebar.Header>My App</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Main</Sidebar.GroupLabel>
				<Sidebar.Item href="#" active>Dashboard</Sidebar.Item>
				<Sidebar.Item href="#">Projects</Sidebar.Item>
				<Sidebar.Item href="#">Tasks</Sidebar.Item>
			</Sidebar.Group>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Settings</Sidebar.GroupLabel>
				<Sidebar.Item href="#">Account</Sidebar.Item>
				<Sidebar.Item href="#">Preferences</Sidebar.Item>
			</Sidebar.Group>
		</Sidebar.Content>
		<Sidebar.Footer>
			<Sidebar.Item href="#">Help & Support</Sidebar.Item>
		</Sidebar.Footer>
	</Sidebar.Root>
	<div class="demo-main">
		<p>Main content area</p>
	</div>
</div>

<style>
	.demo-layout {
		display: grid;
		grid-template-columns: auto 1fr;
		height: 360px;
		border-radius: var(--dry-radius-lg);
		overflow: hidden;
		border: 1px solid var(--dry-color-stroke-weak);
	}

	.demo-main {
		display: grid;
		place-items: center;
		padding: var(--dry-space-6);
		color: var(--dry-color-text-weak);
		font-family: var(--dry-font-sans);
	}
</style>
