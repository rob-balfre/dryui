import type { Snippet } from 'svelte';

export interface TokenScopeProps {
	tokens: Record<string, string>;
	children: Snippet;
}

export { default as TokenScope } from './token-scope.svelte';
