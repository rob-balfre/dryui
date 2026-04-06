import type { ButtonProps as PrimitiveButtonProps } from '@dryui/primitives';
export interface ButtonProps extends PrimitiveButtonProps {
	variant?: 'solid' | 'outline' | 'ghost' | 'soft' | 'secondary' | 'link' | 'bare';
	size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
	color?: 'primary' | 'danger';
}
export { default as Button } from './button.svelte';
