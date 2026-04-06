import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

interface Props extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
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

declare const ChatThread: import('svelte').Component<Props, {}, ''>;
type ChatThread = ReturnType<typeof ChatThread>;

export default ChatThread;
