// Zero-dep JSON/TOML config probes shared by @dryui/feedback-server (dispatch)
// and @dryui/cli (setup-installers). The CLI imports these via the
// `@dryui/feedback-server/internals/probe` subpath. The optional ProbeCache
// lets a caller amortize file reads across many probes against the same file
// (e.g. 8 editors × 2 entry lookups per editor on the same JSON config).

import { readFileSync } from 'node:fs';

export interface ProbeCache {
	json: Map<string, Record<string, unknown> | null>;
	text: Map<string, string | null>;
}

export function createProbeCache(): ProbeCache {
	return { json: new Map(), text: new Map() };
}

export function readRawText(path: string, cache?: ProbeCache): string | null {
	if (cache && cache.text.has(path)) return cache.text.get(path) ?? null;
	let result: string | null;
	try {
		result = readFileSync(path, 'utf8');
	} catch {
		result = null;
	}
	if (cache) cache.text.set(path, result);
	return result;
}

export function readJsonObject(path: string, cache?: ProbeCache): Record<string, unknown> | null {
	if (cache && cache.json.has(path)) return cache.json.get(path) ?? null;
	const raw = readRawText(path, cache)?.trim();
	let parsed: Record<string, unknown> | null = null;
	if (raw) {
		try {
			const value = JSON.parse(raw);
			if (value && typeof value === 'object' && !Array.isArray(value)) {
				parsed = value as Record<string, unknown>;
			}
		} catch {
			parsed = null;
		}
	}
	if (cache) cache.json.set(path, parsed);
	return parsed;
}

export function hasJsonEntry(
	path: string,
	containerKey: string,
	entryKey: string,
	cache?: ProbeCache
): boolean {
	const parsed = readJsonObject(path, cache);
	if (!parsed) return false;
	const container = parsed[containerKey];
	return Boolean(
		container && typeof container === 'object' && !Array.isArray(container) && entryKey in container
	);
}

function escapeRegExp(input: string): string {
	return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const TOML_SECTION_REGEX_CACHE = new Map<string, RegExp>();

function tomlSectionRegex(section: string): RegExp {
	let regex = TOML_SECTION_REGEX_CACHE.get(section);
	if (!regex) {
		regex = new RegExp(`^\\[${escapeRegExp(section)}\\]$`, 'm');
		TOML_SECTION_REGEX_CACHE.set(section, regex);
	}
	return regex;
}

export function hasTomlSection(path: string, section: string, cache?: ProbeCache): boolean {
	const raw = readRawText(path, cache);
	return raw !== null && tomlSectionRegex(section).test(raw);
}
