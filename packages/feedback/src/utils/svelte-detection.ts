import { collectRawSvelteLocations } from './svelte-meta.js';

interface SvelteLocation {
	readonly file: string;
	readonly line?: number;
}

export interface SvelteDetectionResult {
	readonly sourceFile?: string;
	readonly svelteComponent?: string;
	readonly componentStack: readonly string[];
	readonly sourceFiles: readonly string[];
}

const INTERNAL_FILE_PATTERNS = [
	/(^|\/)node_modules\//i,
	/(^|\/)\.svelte-kit\//i,
	/(^|\/)svelte\/internal\//i,
	/(^|\/)svelte\/src\/internal\//i,
	/(^|\/)vite\/deps\//i,
	/^webpack-internal:/i,
	/^<anonymous>$/i
] as const;

function normalizeSourceFile(file: string): string | null {
	const normalized = file
		.trim()
		.replace(/^file:\/\//i, '')
		.replace(/\\/g, '/');
	if (!normalized) return null;

	for (const pattern of INTERNAL_FILE_PATTERNS) {
		if (pattern.test(normalized)) return null;
	}

	const srcIndex = normalized.lastIndexOf('/src/');
	if (srcIndex >= 0) {
		return normalized.slice(srcIndex + 1);
	}

	const routesIndex = normalized.lastIndexOf('/routes/');
	if (routesIndex >= 0) {
		return normalized.slice(routesIndex + 1);
	}

	const libIndex = normalized.lastIndexOf('/lib/');
	if (libIndex >= 0) {
		return normalized.slice(libIndex + 1);
	}

	return normalized;
}

function getComponentName(file: string): string {
	const normalized = file.replace(/\\/g, '/');
	const parts = normalized.split('/').filter(Boolean);
	const filePart = parts.at(-1) ?? normalized;
	const baseName = filePart.replace(/\.svelte(?:\.(?:js|ts))?$/i, '');
	const rawName = baseName === 'index' ? (parts.at(-2) ?? baseName) : baseName;

	if (rawName.startsWith('+') || rawName.includes('[')) {
		return rawName;
	}

	const normalizedName = rawName
		.split(/[-_]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join('');

	if (normalizedName) {
		return normalizedName;
	}

	return rawName.charAt(0).toUpperCase() + rawName.slice(1);
}

function formatSourceFile(file: string, line?: number): string {
	return line ? `${file}:${line}` : file;
}

function collectComponentChain(target: EventTarget | null): SvelteLocation[] {
	return collectRawSvelteLocations(target)
		.map((location) => {
			const file = normalizeSourceFile(location.file);
			if (!file) return null;
			return { file, ...(location.line ? { line: location.line } : {}) };
		})
		.filter((location): location is SvelteLocation => location !== null);
}

export function detectSvelteMetadata(target: EventTarget | null): SvelteDetectionResult {
	const chain = collectComponentChain(target);
	if (chain.length === 0) {
		return {
			componentStack: [],
			sourceFiles: []
		};
	}

	const nearest = chain[0]!;
	const outerToInner = [...chain].reverse();
	const componentStack = outerToInner.map((entry) => getComponentName(entry.file));
	const sourceFiles = outerToInner.map((entry) => entry.file);

	return {
		sourceFile: formatSourceFile(nearest.file, nearest.line),
		svelteComponent: componentStack.join(' > '),
		componentStack,
		sourceFiles
	};
}

export function hasSvelteMetadata(target: EventTarget | null): boolean {
	return detectSvelteMetadata(target).componentStack.length > 0;
}
