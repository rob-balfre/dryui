<script lang="ts">
	import { ChatMessage } from '@dryui/ui/chat-message';
	import { Text } from '@dryui/ui/text';
	import { tick } from 'svelte';

	interface Props {
		output: string;
	}

	let { output }: Props = $props();

	let scrollRef: HTMLDivElement | undefined = $state();

	interface ParsedMessage {
		role: 'user' | 'assistant' | 'system' | 'tool';
		content: string;
	}

	let messages = $derived.by(() => {
		const msgs: ParsedMessage[] = [];
		if (!output) return msgs;

		const lines = output.split('\n').filter((l) => l.trim());
		let currentAssistant = '';

		for (const line of lines) {
			let parsed: Record<string, unknown>;
			try {
				parsed = JSON.parse(line) as Record<string, unknown>;
			} catch {
				// Non-JSON line (stderr, auth errors, etc.)
				msgs.push({ role: 'system', content: line });
				continue;
			}

			const type = parsed['type'] as string | undefined;

			// Codex format
			if (type === 'item.completed') {
				const item = parsed['item'] as Record<string, unknown> | undefined;
				if (item?.['type'] === 'agent_message') {
					msgs.push({ role: 'assistant', content: item['text'] as string });
				} else if (item?.['type'] === 'error') {
					msgs.push({ role: 'system', content: item['message'] as string });
				}
				continue;
			}

			// Gemini format — delta messages
			if (type === 'message' && parsed['delta'] === true) {
				currentAssistant += parsed['content'] as string;
				continue;
			}
			if (type === 'message' && parsed['role'] === 'user') {
				msgs.push({ role: 'user', content: parsed['content'] as string });
				continue;
			}
			if (type === 'message' && parsed['role'] === 'assistant' && !parsed['delta']) {
				msgs.push({ role: 'assistant', content: parsed['content'] as string });
				continue;
			}

			// Gemini/generic result
			if (type === 'result' || type === 'turn.completed' || type === 'thread.completed') {
				if (currentAssistant) {
					msgs.push({ role: 'assistant', content: currentAssistant });
					currentAssistant = '';
				}
				continue;
			}

			// Claude stream-json format — content is an array of {type, text} objects
			if (type === 'assistant' && parsed['message']) {
				const message = parsed['message'] as Record<string, unknown>;
				const content = message['content'];
				if (typeof content === 'string') {
					msgs.push({ role: 'assistant', content });
				} else if (Array.isArray(content)) {
					const text = content
						.filter((c: Record<string, unknown>) => c['type'] === 'text' && c['text'])
						.map((c: Record<string, unknown>) => c['text'] as string)
						.join('');
					if (text) msgs.push({ role: 'assistant', content: text });
				}
				continue;
			}

			// Copilot format — assistant.message with data.content
			if (type === 'assistant.message') {
				const data = parsed['data'] as Record<string, unknown> | undefined;
				if (data?.['content']) {
					msgs.push({ role: 'assistant', content: data['content'] as string });
				}
				continue;
			}
			if (type === 'user.message') {
				const data = parsed['data'] as Record<string, unknown> | undefined;
				if (data?.['content']) {
					msgs.push({ role: 'user', content: data['content'] as string });
				}
				continue;
			}

			// Cursor/OpenCode text events
			if (type === 'text') {
				const part = parsed['part'] as Record<string, unknown> | undefined;
				if (part?.['text']) {
					msgs.push({ role: 'assistant', content: part['text'] as string });
				}
				continue;
			}

			// Error events
			if (type === 'error') {
				const error = parsed['error'] as Record<string, unknown> | string | undefined;
				const errorMsg =
					typeof error === 'string'
						? error
						: ((error?.['message'] as string) ?? JSON.stringify(error));
				msgs.push({ role: 'system', content: errorMsg });
				continue;
			}
		}

		// Flush any remaining streamed content
		if (currentAssistant) {
			msgs.push({ role: 'assistant', content: currentAssistant });
		}

		return msgs;
	});

	$effect(() => {
		if (output && scrollRef) {
			tick().then(() => {
				if (scrollRef) scrollRef.scrollTop = scrollRef.scrollHeight;
			});
		}
	});
</script>

<div bind:this={scrollRef} class="scroll-container">
	<div class="message-stack">
		{#if messages.length === 0}
			<Text color="muted">Waiting for response...</Text>
		{/if}
		{#each messages as msg}
			{#if msg.role === 'assistant'}
				<ChatMessage role="assistant" name="Assistant">
					<Text>{msg.content}</Text>
				</ChatMessage>
			{:else if msg.role === 'user'}
				<ChatMessage role="user" name="You">
					<Text>{msg.content}</Text>
				</ChatMessage>
			{:else}
				<ChatMessage role="system">
					<Text color="muted" size="sm">{msg.content}</Text>
				</ChatMessage>
			{/if}
		{/each}
	</div>
</div>

<style>
	.scroll-container {
		max-height: 60vh;
		overflow-y: auto;
	}

	.message-stack {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
