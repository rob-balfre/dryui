import type { ButtonProps as PrimitiveButtonProps } from '@dryui/primitives';

export type ButtonVariant =
	| 'solid'
	| 'outline'
	| 'ghost'
	| 'soft'
	| 'secondary'
	| 'link'
	| 'bare'
	| 'trigger'
	| 'nav'
	| 'tab'
	| 'toggle'
	| 'pill';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

export type ButtonColor = 'primary' | 'danger' | (string & {}) | null;

export interface ButtonProps extends Omit<PrimitiveButtonProps, 'color'> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	color?: ButtonColor;
}

export { default as Button } from './button.svelte';
