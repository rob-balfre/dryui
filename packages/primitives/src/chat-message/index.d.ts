import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface ChatMessageProps extends HTMLAttributes<HTMLDivElement> {
    role?: 'user' | 'assistant' | 'system';
    avatar?: string;
    name?: string;
    timestamp?: string;
    typing?: boolean;
    children: Snippet;
}
export { default as ChatMessage } from './chat-message.svelte';
