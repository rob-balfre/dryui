import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export type { TransferItem, TransferContext } from './context.svelte.js';

export interface TransferRootProps extends HTMLAttributes<HTMLDivElement> {
	sourceItems: import('./context.svelte.js').TransferItem[];
	targetItems?: import('./context.svelte.js').TransferItem[];
	onChange?: (
		source: import('./context.svelte.js').TransferItem[],
		target: import('./context.svelte.js').TransferItem[]
	) => void;
	children: Snippet;
}

export interface TransferListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	type: 'source' | 'target';
	title?: string | undefined;
	children?: Snippet<[{ items: import('./context.svelte.js').TransferItem[] }]> | undefined;
}

export interface TransferItemProps extends HTMLAttributes<HTMLLabelElement> {
	key: string;
	type: 'source' | 'target';
	disabled?: boolean | undefined;
	children: Snippet;
}

export interface TransferActionsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	children?:
		| Snippet<
				[
					{
						moveToTarget: () => void;
						moveToSource: () => void;
						moveAllToTarget: () => void;
						moveAllToSource: () => void;
						canMoveToTarget: boolean;
						canMoveToSource: boolean;
					}
				]
		  >
		| undefined;
}

import TransferRoot from './transfer-root.svelte';
import TransferList from './transfer-list.svelte';
import TransferItem from './transfer-item.svelte';
import TransferActions from './transfer-actions.svelte';

export const Transfer: {
	Root: typeof TransferRoot;
	List: typeof TransferList;
	Item: typeof TransferItem;
	Actions: typeof TransferActions;
} = {
	Root: TransferRoot,
	List: TransferList,
	Item: TransferItem,
	Actions: TransferActions
};
