<script lang="ts">
	import type { ChatMessage as StudioChatMessage } from '../studio-data';
	import StreamingText from './StreamingText.svelte';

	interface Props {
		message: StudioChatMessage;
	}

	let { message }: Props = $props();
</script>

<article class={`message ${message.role}`}>
	<span class="message-role">{message.role}</span>
	<p><StreamingText text={message.content} /></p>
</article>

<style>
	.message {
		border: 1px solid var(--dry-color-border);
		border-radius: var(--dry-radius-lg);
		padding: var(--dry-space-3);
		background: var(--dry-color-surface-raised);
	}

	.message.user {
		background: color-mix(in srgb, var(--dry-color-primary) 12%, var(--dry-color-surface-raised));
	}

	.message-role {
		display: inline-flex;
		margin-bottom: var(--dry-space-2);
		color: var(--dry-color-text-muted);
		font-size: var(--dry-text-xs-size);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.message p {
		margin: 0;
		line-height: 1.5;
	}
</style>
