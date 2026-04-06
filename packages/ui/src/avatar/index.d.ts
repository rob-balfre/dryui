import type { AvatarProps as PrimitiveAvatarProps } from '@dryui/primitives';
export interface AvatarProps extends PrimitiveAvatarProps {
	size?: 'sm' | 'md' | 'lg';
	shape?: 'circle' | 'square';
}
export { default as Avatar } from './avatar.svelte';
