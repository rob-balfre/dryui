import type { Snippet } from 'svelte';

export interface TokenScopeProps {
	tokens: Record<string, string>;
	children: Snippet;
}

export { TokenScope } from '@dryui/primitives/token-scope';
