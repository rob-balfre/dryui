import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value: string;
	timeout?: number;
	children: Snippet<
		[
			{
				copied: boolean;
				copy: () => void;
			}
		]
	>;
}
declare const Clipboard: import('svelte').Component<Props, {}, ''>;
type Clipboard = ReturnType<typeof Clipboard>;
export default Clipboard;
