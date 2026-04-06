import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface ChatThreadProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	messageCount: number;
	scrollKey?: number;
	children: Snippet<
		[
			{
				index: number;
				viewTransitionName: string;
				isLatest: boolean;
			}
		]
	>;
}
export { default as ChatThread } from './chat-thread.svelte';
