<script lang="ts">
	import { Badge, Button, Card, Separator } from '@dryui/ui';
</script>

<svelte:head>
	<title>dryui studio</title>
</svelte:head>

<section class="page-hero">
	<div class="hero-card">
		<Card.Root>
			<Card.Header>
				<Badge variant="outline" color="blue">Page shell</Badge>
				<h2>Design with a live workspace</h2>
			</Card.Header>
			<Card.Content>
				<p>
					Build the page in the middle, keep the inspector close, and switch between theme, chat,
					and camera controls without leaving the shell.
				</p>
			</Card.Content>
			<Card.Footer>
				<div class="hero-actions">
					<Button type="button" variant="solid">Search palette</Button>
					<Button type="button" variant="outline">Open chat</Button>
				</div>
			</Card.Footer>
		</Card.Root>
	</div>

	<Separator />

	<div class="hint-row">
		<Badge variant="soft" color="gray">canvas-first</Badge>
		<Badge variant="soft" color="gray">spec-driven</Badge>
		<Badge variant="soft" color="gray">gesture-ready</Badge>
	</div>
</section>

<style>
	.page-hero {
		display: grid;
		gap: var(--dry-space-4);
	}

	.hero-card {
		max-width: 760px;
	}

	.hero-card h2 {
		margin: 0;
		font-size: clamp(1.6rem, 3vw, 2.4rem);
	}

	.hero-card p {
		margin: 0;
		color: var(--dry-color-text-muted);
		max-width: 58ch;
	}

	.hero-actions {
		display: flex;
		gap: var(--dry-space-2);
		flex-wrap: wrap;
	}

	.hint-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--dry-space-2);
	}
</style>
