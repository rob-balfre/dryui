import type { Snippet } from 'svelte';
import type {
	TransferListProps as PrimitiveTransferListProps,
	TransferItem as TransferItemType
} from '@dryui/primitives';

export type { TransferRootProps, TransferItemProps, TransferActionsProps } from '@dryui/primitives';

export interface TransferListProps extends PrimitiveTransferListProps {
	filterable?: boolean;
	content?: Snippet<[{ items: TransferItemType[] }]>;
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
