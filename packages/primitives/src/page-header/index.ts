/* Headless export for external consumers; no UI wrapper by design. */
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { PageHeaderMetaColor } from './meta-context.js';

export interface PageHeaderRootProps extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}

export interface PageHeaderContentProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface PageHeaderActionsProps extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
}

export interface PageHeaderEyebrowProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface PageHeaderTitleProps extends HTMLAttributes<HTMLHeadingElement> {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	children: Snippet;
}

export interface PageHeaderDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}

export interface PageHeaderMetaProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
	variant?: 'solid' | 'outline' | 'soft';
	color?: PageHeaderMetaColor;
	size?: 'sm' | 'md';
}

export { getPageHeaderMetaCtx } from './meta-context.js';
export type { PageHeaderMetaContext, PageHeaderMetaColor } from './meta-context.js';

import PageHeaderRoot from './page-header-root.svelte';
import PageHeaderContent from './page-header-content.svelte';
import PageHeaderActions from './page-header-actions.svelte';
import PageHeaderEyebrow from './page-header-eyebrow.svelte';
import PageHeaderTitle from './page-header-title.svelte';
import PageHeaderDescription from './page-header-description.svelte';
import PageHeaderMeta from './page-header-meta.svelte';

export const PageHeader: {
	Root: typeof PageHeaderRoot;
	Content: typeof PageHeaderContent;
	Actions: typeof PageHeaderActions;
	Eyebrow: typeof PageHeaderEyebrow;
	Title: typeof PageHeaderTitle;
	Description: typeof PageHeaderDescription;
	Meta: typeof PageHeaderMeta;
} = {
	Root: PageHeaderRoot,
	Content: PageHeaderContent,
	Actions: PageHeaderActions,
	Eyebrow: PageHeaderEyebrow,
	Title: PageHeaderTitle,
	Description: PageHeaderDescription,
	Meta: PageHeaderMeta
};
