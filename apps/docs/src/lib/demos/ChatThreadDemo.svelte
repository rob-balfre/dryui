<script lang="ts">
	import { ChatThread } from '@dryui/ui';
</script>

<ChatThread messageCount={2}>
	{#snippet children({ index })}
		{#if index === 0}
			<div class="chat-msg" data-variant="sent">
				<div class="chat-msg-header">
					<span class="chat-msg-name">Alice</span>
				</div>
				<div class="chat-msg-body">How does theming work?</div>
			</div>
		{:else}
			<div class="chat-msg" data-variant="received">
				<div class="chat-msg-header">
					<span class="chat-msg-name">Bot</span>
				</div>
				<div class="chat-msg-body">
					Themes use semantic CSS custom properties that cascade through every component.
				</div>
			</div>
		{/if}
	{/snippet}
</ChatThread>

<style>
	.chat-msg {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-3) var(--dry-space-4);
		border-radius: var(--dry-radius-lg);
	}

	.chat-msg[data-variant='sent'] {
		justify-self: end;
		background: var(--dry-color-fill-brand);
		color: var(--dry-color-text-on-fill);
		border-end-end-radius: var(--dry-radius-sm);
	}

	.chat-msg[data-variant='received'] {
		justify-self: start;
		background: var(--dry-color-bg-raised);
		border-end-start-radius: var(--dry-radius-sm);
	}

	.chat-msg-header {
		display: grid;
		grid-auto-flow: column;
		justify-content: start;
		gap: var(--dry-space-2);
	}

	.chat-msg-name {
		font-size: var(--dry-type-small-size);
		font-weight: 600;
	}

	.chat-msg-body {
		font-size: var(--dry-type-body-size);
	}
</style>
