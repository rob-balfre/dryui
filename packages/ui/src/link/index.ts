import type { LinkProps as PrimitiveLinkProps } from '@dryui/primitives';

export interface LinkProps extends PrimitiveLinkProps {
	underline?: 'always' | 'hover' | 'none';
}

export { default as Link } from './link.svelte';
