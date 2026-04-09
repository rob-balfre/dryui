import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	children: Snippet;
}
export interface TextProps extends HTMLAttributes<HTMLElement> {
	as?: 'p' | 'span' | 'div';
	children: Snippet;
}
export interface CodeProps extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
export interface BlockquoteProps extends HTMLAttributes<HTMLQuoteElement> {
	children: Snippet;
}
import TypographyHeading from './heading.svelte';
import TypographyText from './text.svelte';
import TypographyCode from './code.svelte';
import TypographyBlockquote from './blockquote.svelte';
export declare const Typography: {
	Heading: typeof TypographyHeading;
	Text: typeof TypographyText;
	Code: typeof TypographyCode;
	Blockquote: typeof TypographyBlockquote;
};
