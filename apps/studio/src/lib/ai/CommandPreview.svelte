<script lang="ts">
	import { Badge, Button, Card } from '@dryui/ui';
	import type { StudioCommandPreview } from './chat-store.svelte';

	interface Props {
		preview: StudioCommandPreview;
		onApply: () => void;
		onDismiss: () => void;
	}

	let { preview, onApply, onDismiss }: Props = $props();
</script>

<Card.Root>
	<Card.Header>
		<div class="header-copy">
			<Badge variant="outline" color="blue">Preview</Badge>
			<h3>{preview.summary}</h3>
		</div>
		<p>{preview.prompt}</p>
	</Card.Header>
	<Card.Content>
		<ul class="preview-list">
			{#each preview.lines as line (line)}
				<li>{line}</li>
			{/each}
		</ul>

		<div class="actions">
			<Button type="button" variant="solid" onclick={onApply}>Apply preview</Button>
			<Button type="button" variant="outline" onclick={onDismiss}>Dismiss</Button>
		</div>
	</Card.Content>
</Card.Root>

<style>
	.header-copy {
		display: flex;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.header-copy h3,
	p {
		margin: 0;
	}

	p {
		color: var(--dry-color-text-muted);
	}

	.preview-list {
		margin: 0;
		padding-left: 1rem;
		display: grid;
		gap: var(--dry-space-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--dry-space-2);
		margin-top: var(--dry-space-3);
	}
</style>
