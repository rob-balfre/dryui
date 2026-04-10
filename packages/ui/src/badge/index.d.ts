import type { BadgeProps as PrimitiveBadgeProps } from '@dryui/primitives';
import type { AliasableColor } from '../internal/color-aliases.js';
export type BadgeColor = AliasableColor;
export interface BadgeProps extends PrimitiveBadgeProps {
    variant?: 'solid' | 'outline' | 'soft' | 'dot';
    color?: BadgeColor;
    size?: 'sm' | 'md';
}
export { default as Badge } from './badge.svelte';
