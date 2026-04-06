import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type TransferItem } from '@dryui/primitives';
interface Props extends HTMLAttributes<HTMLDivElement> {
	sourceItems: TransferItem[];
	targetItems?: TransferItem[];
	onChange?: (source: TransferItem[], target: TransferItem[]) => void;
	children: Snippet;
}
declare const TransferRoot: import('svelte').Component<Props, {}, 'sourceItems' | 'targetItems'>;
type TransferRoot = ReturnType<typeof TransferRoot>;
export default TransferRoot;
