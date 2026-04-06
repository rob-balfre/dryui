import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface FooterRootProps extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}

export interface FooterBrandProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface FooterLinksProps extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}

export interface FooterLinkGroupProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
	heading?: string;
}

export interface FooterCopyrightProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

import FooterRoot from './footer-root.svelte';
import FooterBrand from './footer-brand.svelte';
import FooterLinks from './footer-links.svelte';
import FooterLinkGroup from './footer-link-group.svelte';
import FooterCopyright from './footer-copyright.svelte';

export const Footer: {
	Root: typeof FooterRoot;
	Brand: typeof FooterBrand;
	Links: typeof FooterLinks;
	LinkGroup: typeof FooterLinkGroup;
	Copyright: typeof FooterCopyright;
} = {
	Root: FooterRoot,
	Brand: FooterBrand,
	Links: FooterLinks,
	LinkGroup: FooterLinkGroup,
	Copyright: FooterCopyright
};
