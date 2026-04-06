import type {
	HeadingProps as PrimitiveHeadingProps,
	TextProps as PrimitiveTextProps
} from '@dryui/primitives';
export interface HeadingProps extends PrimitiveHeadingProps {
	variant?: 'default' | 'display';
}
export type { CodeProps, BlockquoteProps } from '@dryui/primitives';
export interface TextProps extends PrimitiveTextProps {
	color?: 'default' | 'muted' | 'secondary';
	variant?: 'default' | 'muted' | 'secondary';
	size?: 'sm' | 'md' | 'lg';
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
