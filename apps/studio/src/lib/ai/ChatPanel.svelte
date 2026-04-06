<script lang="ts">
	import { Badge, Button, Card, Textarea } from '@dryui/ui';
	import type { ChatMessage } from '../studio-data';
	import type { ChatConnectionStatus, StudioCommandPreview } from './chat-store.svelte';
	import ChatMessageRow from './ChatMessage.svelte';
	import CommandPreview from './CommandPreview.svelte';

	interface Props {
		messages: ChatMessage[];
		preview: StudioCommandPreview | null;
		status: ChatConnectionStatus;
		onSend: (content: string) => void;
		onApplyPreview: () => void;
		onDismissPreview: () => void;
	}

	let { messages, preview, status, onSend, onApplyPreview, onDismissPreview }: Props = $props();

	let draft = $state('');

	function sendMessage() {
		const content = draft.trim();
		if (!content) {
			return;
		}

		onSend(content);
		draft = '';
	}

	const statusLabel = $derived(
		status === 'connected'
			? 'server connected'
			: status === 'connecting'
				? 'connecting'
				: status === 'error'
					? 'connection error'
					: 'local preview'
	);
</script>

<section class="panel">
	<Card.Root>
		<div class="panel-header">
			<Card.Header>
				<div class="header-copy">
					<Badge variant="outline" color="blue">AI</Badge>
					<h2>Command chat</h2>
				</div>
				<p>
					Draft canvas changes in natural language, preview them, then commit them through the
					command bus.
				</p>
			</Card.Header>
			<Badge variant="soft" color="gray" size="sm">{statusLabel}</Badge>
		</div>

		<div class="panel-body">
			<Card.Content>
				<div class="message-list" role="log" aria-live="polite">
					{#each messages as message (message.id)}
						<ChatMessageRow {message} />
					{/each}
				</div>

				{#if preview}
					<CommandPreview {preview} onApply={onApplyPreview} onDismiss={onDismissPreview} />
				{/if}

				<Textarea
					bind:value={draft}
					placeholder="Describe a layout change..."
					aria-label="Prompt"
				/>

				<div class="actions">
					<Button type="button" variant="outline" onclick={() => (draft = 'Add card')}
						>Use example</Button
					>
					<Button type="button" variant="solid" onclick={sendMessage}>Send</Button>
				</div>
			</Card.Content>
		</div>
	</Card.Root>
</section>

<style>
	.panel {
		height: 100%;
	}

	.panel-header {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: var(--dry-space-3);
	}

	.header-copy {
		display: flex;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.header-copy h2 {
		margin: 0;
	}

	.panel-header p {
		margin: 0;
		color: var(--dry-color-text-muted);
	}

	.panel-body {
		display: grid;
		gap: var(--dry-space-4);
	}

	.message-list {
		display: grid;
		gap: var(--dry-space-3);
		max-height: 240px;
		overflow: auto;
		padding-right: var(--dry-space-1);
	}

	.actions {
		display: flex;
		gap: var(--dry-space-2);
		justify-content: space-between;
	}
</style>
