<script lang="ts">
	import { Container, Link, Separator, Text } from '@dryui/ui';
</script>

<footer>
	<Container>
		<div class="grid">
			<div>
				<Text>DryUI</Text>
				<Text>Composable Svelte 5 components.</Text>
			</div>
			<div>
				<Text>Product</Text>
				<Link href="#">Components</Link>
				<Link href="#">Themes</Link>
				<Link href="#">Releases</Link>
			</div>
			<div>
				<Text>Company</Text>
				<Link href="#">About</Link>
				<Link href="#">Careers</Link>
				<Link href="#">Contact</Link>
			</div>
		</div>
		<Separator />
		<Text>2026 DryUI. All rights reserved.</Text>
	</Container>
</footer>

<style>
	footer {
		padding-block: var(--dry-space-6, 1.5rem);
		background: var(--dry-color-bg-base);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-6, 1.5rem);
		padding-block-end: var(--dry-space-6, 1.5rem);
	}

	div {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
	}
</style>
