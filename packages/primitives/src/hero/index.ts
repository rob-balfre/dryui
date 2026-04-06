import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface HeroRootProps extends HTMLAttributes<HTMLElement> {
	children: Snippet;
	align?: 'center' | 'left';
	size?: 'sm' | 'md' | 'lg';
	backgroundImage?: string;
	overlay?: boolean;
}

export interface HeroHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
	children: Snippet;
}

export interface HeroSubheadingProps extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}

export interface HeroActionsProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

import HeroRoot from './hero-root.svelte';
import HeroHeading from './hero-heading.svelte';
import HeroSubheading from './hero-subheading.svelte';
import HeroActions from './hero-actions.svelte';

export const Hero: {
	Root: typeof HeroRoot;
	Heading: typeof HeroHeading;
	Subheading: typeof HeroSubheading;
	Actions: typeof HeroActions;
} = {
	Root: HeroRoot,
	Heading: HeroHeading,
	Subheading: HeroSubheading,
	Actions: HeroActions
};
