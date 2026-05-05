<script lang="ts">
	import { Heading } from '@dryui/ui';
</script>

<div class="stack">
	<Heading level={1} variant="display">Display heading</Heading>
	<Heading level={2}>Section heading</Heading>
	<Heading level={3}>Subsection heading</Heading>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
		justify-items: start;
	}
</style>
