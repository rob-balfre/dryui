// Build-time generator: parses the UI theme CSS files and emits a JSON
// snapshot of the token values. This lets @dryui/mcp (and the bundled
// @dryui/cli) consume theme tokens at runtime without reading files from
// @dryui/ui/src, which is not shipped in the published tarball.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const themeDir = resolve(here, '../../ui/src/themes');
const outPath = resolve(here, 'theme-tokens.generated.json');

function parseTokens(css: string): Record<string, string> {
	const tokens: Record<string, string> = {};
	const regex = /(--dry-[\w-]+)\s*:\s*([^;]+);/g;
	const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');

	for (const match of stripped.matchAll(regex)) {
		const name = match[1]?.trim();
		const value = match[2]?.trim();
		if (!name || !value || name in tokens) continue;
		tokens[name] = value;
	}

	return tokens;
}

function main(): void {
	const light = parseTokens(readFileSync(resolve(themeDir, 'default.css'), 'utf-8'));
	const dark = parseTokens(readFileSync(resolve(themeDir, 'dark.css'), 'utf-8'));
	const payload = { light, dark };
	writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
	console.log(
		`Wrote ${outPath} (light: ${Object.keys(light).length}, dark: ${Object.keys(dark).length})`
	);
}

main();
