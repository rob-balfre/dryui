<script lang="ts">
	import { AppFrame, Button, Heading } from '@dryui/ui';
</script>

<AppFrame title="App">
	{#snippet actions()}
		<Button size="sm" variant="ghost">Invite</Button>
		<Button size="sm" variant="solid">Publish</Button>
	{/snippet}

	<div class="shell">
		<nav class="sidebar" aria-label="Primary">
			<a class="nav-item" data-active href="#overview">Overview</a>
			<a class="nav-item" href="#projects">Projects</a>
			<a class="nav-item" href="#members">Members</a>
			<a class="nav-item" href="#settings">Settings</a>
		</nav>

		<section class="main">
			<Heading level={3}>Overview</Heading>
		</section>
	</div>
</AppFrame>

<style>
	.shell {
		display: grid;
		grid-template-columns: 13rem minmax(0, 1fr);
		min-block-size: 18rem;
	}

	.sidebar {
		display: grid;
		align-content: start;
		gap: var(--dry-space-1);
		padding: var(--dry-space-4);
	}

	.nav-item {
		display: grid;
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		color: var(--dry-color-text-weak);
		font-size: var(--dry-text-sm-size);
		text-decoration: none;
	}

	.nav-item[data-active] {
		color: var(--dry-color-text-strong);
	}

	.main {
		display: grid;
		align-content: start;
		gap: var(--dry-space-5);
		padding: var(--dry-space-5) var(--dry-space-6);
	}
</style>
