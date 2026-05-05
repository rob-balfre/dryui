<script lang="ts">
	import { Container, Heading } from '@dryui/ui';
</script>

<Container size="md">
	<Heading level={3}>Constrained content</Heading>
	<p>
		Container clamps content to a readable measure. Use it to wrap long-form text, articles, or any
		section that should stay narrow on wide viewports.
	</p>
</Container>

<style>
	p {
		margin: var(--dry-space-3) 0 0;
		line-height: 1.6;
		color: var(--dry-color-text-strong);
	}
</style>
