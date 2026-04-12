import type { TagProps as PrimitiveTagProps } from '@dryui/primitives';
import type { BadgeColor } from '../badge/index.js';

export type TagColor = BadgeColor;

export interface TagProps extends PrimitiveTagProps {
	variant?: 'solid' | 'outline' | 'soft';
	color?: TagColor;
	size?: 'sm' | 'md';
}

export { default as Tag } from './tag-button.svelte';
