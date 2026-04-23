let fallbackCounter = 0;

/**
 * Runtime-only unique ID helper. Svelte components should prefer `$props.id()`
 * for IDs that must survive SSR hydration.
 */
export function createId(prefix = 'dryui'): string {
	const randomId = globalThis.crypto?.randomUUID?.() ?? `fallback-${++fallbackCounter}`;
	return `${prefix}-${randomId}`;
}
