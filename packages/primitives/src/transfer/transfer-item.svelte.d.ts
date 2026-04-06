import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLLabelElement> {
	key: string;
	type: 'source' | 'target';
	disabled?: boolean | undefined;
	children: Snippet;
}
declare const TransferItem: import('svelte').Component<Props, {}, ''>;
type TransferItem = ReturnType<typeof TransferItem>;
export default TransferItem;
