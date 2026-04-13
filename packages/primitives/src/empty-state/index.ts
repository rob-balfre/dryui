import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface EmptyStateRootProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface EmptyStateIconProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface EmptyStateTitleProps extends HTMLAttributes<HTMLHeadingElement> {
	children: Snippet;
}

export interface EmptyStateDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}

export interface EmptyStateActionProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

import EmptyStateRoot from '../internal/snippet-div.svelte';
import EmptyStateIcon from './empty-state-icon.svelte';
import EmptyStateTitle from './empty-state-title.svelte';
import EmptyStateDescription from '../internal/paragraph.svelte';
import EmptyStateAction from '../internal/snippet-div.svelte';

export const EmptyState: {
	Root: typeof EmptyStateRoot;
	Icon: typeof EmptyStateIcon;
	Title: typeof EmptyStateTitle;
	Description: typeof EmptyStateDescription;
	Action: typeof EmptyStateAction;
} = {
	Root: EmptyStateRoot,
	Icon: EmptyStateIcon,
	Title: EmptyStateTitle,
	Description: EmptyStateDescription,
	Action: EmptyStateAction
};
