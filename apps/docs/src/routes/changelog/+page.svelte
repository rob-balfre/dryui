<script lang="ts">
	import { Container, MarkdownRenderer } from '@dryui/ui';

	let { data } = $props();
</script>

<svelte:head>
	<title>Changelog — dryui</title>
</svelte:head>

<Container>
	<div class="changelog">
		<MarkdownRenderer content={data.content} />
	</div>
</Container>

<style>
	.changelog {
		padding: var(--dry-space-12) 0 var(--dry-space-8);
	}
</style>
