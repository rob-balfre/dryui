import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { aiSurface } from './ai-surface.js';
import { componentImplementationDir } from './component-identity.js';
import type { ComponentMetaEntry } from './component-catalog.js';
import { loadComponentMeta } from './load-component-meta.js';
import {
	parseCompoundParts,
	parseDefaults,
	partPropInterfaceNames
} from './spec-source-extraction.js';
import { buildCompositionSpec } from './spec-composition.js';
import { generateExample } from './spec-examples.js';
import {
	buildComponentSpec,
	parsePartContract,
	type ComponentShape,
	type SourceLayer
} from './spec-component-builder.js';

type SpecGenerationPaths = {
	uiSrc: string;
	primSrc: string;
	componentMeta?: Record<string, ComponentMetaEntry>;
};

type GeneratedSpec = {
	version: string;
	package: string;
	themeImports: {
		default: string;
		dark: string;
	};
	components: Record<string, ComponentShape>;
	composition: ReturnType<typeof buildCompositionSpec>;
	ai: typeof aiSurface;
};

async function readText(filePath: string): Promise<string> {
	return readFile(filePath, 'utf8');
}

async function listFileNames(dirPath: string): Promise<string[]> {
	const entries = await readdir(dirPath, { withFileTypes: true });
	return entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
}

async function generateSpec(paths: SpecGenerationPaths): Promise<GeneratedSpec> {
	const { uiSrc, primSrc } = paths;
	// Load per-component meta.ts files. These are the single source of truth
	// for description/category/tags/surface.
	const componentMeta = paths.componentMeta ?? (await loadComponentMeta()).entries;

	const indexSrc = await readText(join(uiSrc, 'index.ts'));
	const componentNames: string[] = [];

	for (const match of indexSrc.matchAll(
		/export \{ (\w+)[\s,}].*? from '\.\/([\w-]+)\/index\.js'/g
	)) {
		const name = match[1];
		const first = name?.slice(0, 1) ?? '';
		if (!name || first === first.toLowerCase()) continue;
		if (!componentNames.includes(name)) componentNames.push(name);
	}

	const components: Record<string, ComponentShape> = {};
	const builderFs = { readText, listFileNames };

	for (const name of componentNames) {
		const dir = componentImplementationDir(name);
		const dirPath = join(uiSrc, dir);
		const indexPath = join(dirPath, 'index.ts');
		const indexContent = await readText(indexPath);
		const source: SourceLayer = { dirPath, indexPath, indexContent };

		// Read primitives source as fallback for inherited/re-exported props
		let primitiveSource: SourceLayer | null = null;
		try {
			const primIndexPath = join(primSrc, dir, 'index.ts');
			primitiveSource = {
				dirPath: join(primSrc, dir),
				indexPath: primIndexPath,
				indexContent: await readText(primIndexPath)
			};
		} catch {
			/* no primitives source for this component */
		}

		const meta = componentMeta[name];
		if (!meta) {
			console.warn(`  Missing metadata for ${name}`);
			continue;
		}

		components[name] = await buildComponentSpec({
			name,
			meta,
			source,
			primitiveSource,
			uiSrc,
			importPath: '@dryui/ui',
			fs: builderFs
		});
	}

	// Pass 2: scan primitives for components without UI layer.
	// Sort alphabetically so the spec output is deterministic across
	// filesystems now that metadata comes from on-disk .meta.ts files.
	for (const name of [...Object.keys(componentMeta)].sort((a, b) => a.localeCompare(b))) {
		if (components[name]) continue; // already found in UI
		if (componentMeta[name]?.surface !== 'primitive') continue;
		const dir = componentImplementationDir(name);
		const dirPath = join(primSrc, dir);
		const indexPath = join(dirPath, 'index.ts');
		let indexContent: string;
		try {
			indexContent = await readText(indexPath);
		} catch {
			continue; // directory doesn't exist
		}

		const meta = componentMeta[name];
		if (!meta) continue;
		components[name] = await buildComponentSpec({
			name,
			meta,
			source: { dirPath, indexPath, indexContent },
			importPath: '@dryui/primitives',
			fs: builderFs
		});
	}

	const _pkgRaw: unknown = JSON.parse(await readText(resolve(uiSrc, '../package.json')));
	if (
		typeof _pkgRaw !== 'object' ||
		_pkgRaw === null ||
		!('name' in _pkgRaw) ||
		!('version' in _pkgRaw)
	) {
		throw new Error('Invalid package.json: missing name or version');
	}
	const packageJson = { name: String(_pkgRaw.name), version: String(_pkgRaw.version) };
	return {
		version: packageJson.version,
		package: packageJson.name,
		themeImports: {
			default: `${packageJson.name}/themes/default.css`,
			dark: `${packageJson.name}/themes/dark.css`
		},
		components,
		composition: buildCompositionSpec(),
		ai: aiSurface
	};
}

export {
	generateSpec,
	parseCompoundParts,
	parsePartContract,
	generateExample,
	partPropInterfaceNames,
	parseDefaults
};
