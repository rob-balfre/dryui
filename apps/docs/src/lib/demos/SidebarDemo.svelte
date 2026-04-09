<script lang="ts">
	import { Sidebar } from '@dryui/ui';
	import { FolderKanban, LayoutDashboard, LifeBuoy, ListTodo, Settings2 } from 'lucide-svelte';
</script>

<div class="demo-layout">
	<Sidebar.Root>
		<Sidebar.Header>
			<div class="app-header">
				<div class="app-mark">DA</div>
				<div class="app-copy">
					<strong>Dry Atlas</strong>
					<span>Product design workspace</span>
				</div>
			</div>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
				<Sidebar.Item href="#" active>
					<LayoutDashboard size={16} aria-hidden="true" />
					Dashboard
				</Sidebar.Item>
				<Sidebar.Item href="#">
					<FolderKanban size={16} aria-hidden="true" />
					Projects
				</Sidebar.Item>
				<Sidebar.Item href="#">
					<ListTodo size={16} aria-hidden="true" />
					Tasks
				</Sidebar.Item>
			</Sidebar.Group>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Manage</Sidebar.GroupLabel>
				<Sidebar.Item href="#">
					<Settings2 size={16} aria-hidden="true" />
					Preferences
				</Sidebar.Item>
			</Sidebar.Group>
		</Sidebar.Content>
		<Sidebar.Footer>
			<Sidebar.Item href="#">
				<LifeBuoy size={16} aria-hidden="true" />
				Help & Support
			</Sidebar.Item>
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
		height: 420px;
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

	.app-header {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.app-mark {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		height: var(--dry-space-10);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-raised);
		font-size: var(--dry-text-sm-size);
		font-weight: 700;
		letter-spacing: 0.08em;
	}

	.app-copy {
		display: grid;
		gap: var(--dry-space-1);
	}

	.app-copy strong {
		font-size: var(--dry-text-base-size);
		font-weight: 600;
	}

	.app-copy span {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-text-sm-size);
	}
</style>
