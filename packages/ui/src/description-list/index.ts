import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface DescriptionListRootProps extends HTMLAttributes<HTMLDListElement> {
	children: Snippet;
}

export interface DescriptionListItemProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface DescriptionListTermProps extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}

export interface DescriptionListDescriptionProps extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}

import DescriptionListRoot from './description-list-root.svelte';
import DescriptionListItem from './description-list-item.svelte';
import DescriptionListTerm from './description-list-term.svelte';
import DescriptionListDescription from './description-list-description.svelte';

export const DescriptionList: {
	Root: typeof DescriptionListRoot;
	Item: typeof DescriptionListItem;
	Term: typeof DescriptionListTerm;
	Description: typeof DescriptionListDescription;
} = {
	Root: DescriptionListRoot,
	Item: DescriptionListItem,
	Term: DescriptionListTerm,
	Description: DescriptionListDescription
};
