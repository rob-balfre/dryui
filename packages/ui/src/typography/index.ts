import type { TextProps as SharedTextProps } from '../text/index.js';

export type { HeadingProps } from '../heading/index.js';

export type { CodeProps, BlockquoteProps } from '@dryui/primitives';

export interface TextProps extends Omit<SharedTextProps, 'color' | 'variant'> {
	color?: 'default' | 'muted' | 'secondary';
	variant?: 'default' | 'muted' | 'secondary' | 'label';
	size?: SharedTextProps['size'];
	font?: SharedTextProps['font'];
	weight?: SharedTextProps['weight'];
	className?: SharedTextProps['className'];
}

import TypographyHeading from './heading.svelte';
import TypographyText from './text.svelte';
import TypographyCode from './code.svelte';
import TypographyBlockquote from './blockquote.svelte';

export const Typography: {
	Heading: typeof TypographyHeading;
	Text: typeof TypographyText;
	Code: typeof TypographyCode;
	Blockquote: typeof TypographyBlockquote;
} = {
	Heading: TypographyHeading,
	Text: TypographyText,
	Code: TypographyCode,
	Blockquote: TypographyBlockquote
};
