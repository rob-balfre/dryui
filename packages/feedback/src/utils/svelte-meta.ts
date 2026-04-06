export interface RawSvelteLocation {
	readonly file: string;
	readonly line?: number;
}

interface SvelteMetaCarrier {
	__svelte_meta?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function isNodeLike(value: unknown): value is Node {
	return typeof Node !== 'undefined' && value instanceof Node;
}

function getNumericLine(value: unknown): number | undefined {
	if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
		return Math.trunc(value);
	}

	return undefined;
}

function readRawSvelteLocation(node: Node): RawSvelteLocation | null {
	const meta = (node as Node & SvelteMetaCarrier).__svelte_meta;
	if (!isRecord(meta)) return null;

	const loc = isRecord(meta.loc) ? meta.loc : null;
	if (!loc || typeof loc.file !== 'string') return null;

	const start = isRecord(loc.start) ? loc.start : null;
	const line = getNumericLine(loc.line) ?? getNumericLine(start?.line);
	return { file: loc.file, ...(line ? { line } : {}) };
}

function getNextNode(node: Node): Node | null {
	if (typeof ShadowRoot !== 'undefined' && node instanceof ShadowRoot) {
		return node.host;
	}

	if (node.parentNode) {
		return node.parentNode;
	}

	const root = typeof node.getRootNode === 'function' ? node.getRootNode() : null;
	if (typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) {
		return root.host;
	}

	return null;
}

export function collectRawSvelteLocations(target: EventTarget | null): RawSvelteLocation[] {
	if (!isNodeLike(target)) return [];

	const chain: RawSvelteLocation[] = [];
	const visited = new Set<Node>();
	let current: Node | null = target;

	while (current && !visited.has(current)) {
		visited.add(current);

		const location = readRawSvelteLocation(current);
		if (location) {
			const previous = chain.at(-1);
			if (previous?.file === location.file) {
				if (previous.line === undefined && location.line !== undefined) {
					chain[chain.length - 1] = location;
				}
			} else {
				chain.push(location);
			}
		}

		current = getNextNode(current);
	}

	return chain;
}

export function findTargetElement(target: EventTarget | null): Element | null {
	if (target instanceof Element) return target;
	if (target instanceof Text) return target.parentElement;
	if (isNodeLike(target) && target.parentNode instanceof Element) return target.parentNode;
	return null;
}
