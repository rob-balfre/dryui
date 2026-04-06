import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	role?: 'user' | 'assistant' | 'system';
	avatar?: string;
	name?: string;
	timestamp?: string;
	typing?: boolean;
	children: Snippet;
}
declare const ChatMessage: import('svelte').Component<Props, {}, ''>;
type ChatMessage = ReturnType<typeof ChatMessage>;
export default ChatMessage;
