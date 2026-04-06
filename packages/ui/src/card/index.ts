import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface CardRootProps extends HTMLAttributes<HTMLElement> {
	as?: 'div' | 'a' | 'button';
	selected?: boolean;
	disabled?: boolean;
	orientation?: 'vertical' | 'horizontal';
	variant?: 'default' | 'elevated' | 'interactive';
	size?: 'default' | 'sm';
	children: Snippet;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
	noPadding?: boolean;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

import CardRoot from './card-root.svelte';
import CardHeader from './card-header.svelte';
import CardContent from './card-content.svelte';
import CardFooter from './card-footer.svelte';

export const Card: {
	Root: typeof CardRoot;
	Header: typeof CardHeader;
	Content: typeof CardContent;
	Footer: typeof CardFooter;
} = {
	Root: CardRoot,
	Header: CardHeader,
	Content: CardContent,
	Footer: CardFooter
};
