<script lang="ts">
	import AiChatPanel from '../ai/ChatPanel.svelte';
	import type { ChatMessage } from '../studio-data';
	import type { ChatConnectionStatus, StudioCommandPreview } from '../ai/chat-store.svelte';

	interface Props {
		messages: ChatMessage[];
		preview: StudioCommandPreview | null;
		status: ChatConnectionStatus;
		onSend: (content: string) => void;
		onApplyPreview: () => void;
		onDismissPreview: () => void;
	}

	let { messages, preview, status, onSend, onApplyPreview, onDismissPreview }: Props = $props();
</script>

<AiChatPanel {messages} {preview} {status} {onSend} {onApplyPreview} {onDismissPreview} />
