import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { aiSurface } from './ai-surface.js';
import { componentImplementationDir } from './component-identity.js';
import type { ComponentMetaEntry } from './component-catalog.js';
import { loadComponentMeta } from './load-component-meta.js';
import {
	applyPropSourceFacts,
	collectDataAttributes,
	findBindableProps,
	findBindablePropsSimple,
	parseCompoundParts,
	parseDefaults,
	parsePartContract as parsePartContractFromSource,
	parsePropContract as parsePropContractFromSource,
	partPropInterfaceNames,
	type DataAttributeShape,
	type ForwardedPropsShape,
	type PartShape,
	type PropShape
} from './spec-source-extraction.js';
import { buildCompositionSpec } from './spec-composition.js';
import { generateExample } from './spec-examples.js';
import {
	deriveStructure,
	describeDataAttribute,
	getA11yNotes,
	propGroupsForComponent,
	propMetadataResolver,
	type PropGroupShape,
	type StructureShape
} from './spec-prose.js';
import {
	addStyleSurfaceSource,
	createStyleSurfaceAccumulator,
	finalizeStyleSurface,
	isStyleSurfaceFile,
	sharedStyleSurfacesForComponent,
	type StyleSurfaceFilters
} from './spec-style-surface.js';

type ComponentShape = {
	import: string;
	description: string;
	category: string;
	tags: string[];
	compound: boolean;
	props?: Record<string, PropShape>;
	parts?: Record<string, PartShape>;
	forwardedProps?: ForwardedPropsShape | null;
	groups?: PropGroupShape[];
	structure?: StructureShape | null;
	a11y?: string[];
	cssVars: Record<string, string>;
	dataAttributes: DataAttributeShape[];
	example: string;
};

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

function parsePropContract(
	source: string,
	name: string,
	componentName: string,
	partName?: string
): { props: Record<string, PropShape>; forwardedProps: ForwardedPropsShape | null } {
	return parsePropContractFromSource(source, name, componentName, partName, propMetadataResolver);
}

function parsePartContract(
	source: string,
	componentName: string,
	partName: string,
	sourcePath?: string
): { props: Record<string, PropShape>; forwardedProps: ForwardedPropsShape | null } {
	return parsePartContractFromSource(
		source,
		componentName,
		partName,
		sourcePath,
		propMetadataResolver
	);
}

async function readText(filePath: string): Promise<string> {
	return readFile(filePath, 'utf8');
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

	for (const name of componentNames) {
		const dir = componentImplementationDir(name);
		const dirPath = join(uiSrc, dir);
		const indexPath = join(dirPath, 'index.ts');
		const indexContent = await readText(indexPath);

		// Read primitives source as fallback for inherited/re-exported props
		let primContent: string | null = null;
		let primIndexPath: string | null = null;
		try {
			primIndexPath = join(primSrc, dir, 'index.ts');
			primContent = await readText(primIndexPath);
		} catch {
			/* no primitives source for this component */
		}

		const meta = componentMeta[name];
		if (!meta) {
			console.warn(`  Missing metadata for ${name}`);
			continue;
		}

		const parts = parseCompoundParts(indexContent, name);
		const compound = parts !== null;
		const example = generateExample(name, compound, parts ?? undefined);
		let propsOrParts: Pick<ComponentShape, 'props' | 'parts' | 'forwardedProps'>;

		if (compound) {
			const partsObj: Record<string, PartShape> = {};
			for (const part of parts) {
				const contract = parsePartContract(indexContent, name, part, indexPath);
				const parsed = contract.props;
				let fwdProps = contract.forwardedProps;

				// Merge props from primitives for this part
				if (primContent && primIndexPath) {
					const primContract = parsePartContract(primContent, name, part, primIndexPath);
					for (const [key, val] of Object.entries(primContract.props)) {
						if (!parsed[key]) parsed[key] = val;
					}
					if (!fwdProps && primContract.forwardedProps) {
						fwdProps = primContract.forwardedProps;
					}
				}

				const bindableProps = findBindableProps(dir, part);
				const partKebab = part.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
				const svelteFile = join(dirPath, `${dir}-${partKebab}.svelte`);
				try {
					applyPropSourceFacts(parsed, { defaults: parseDefaults(await readText(svelteFile)) });
				} catch {
					/* file may not exist */
				}
				applyPropSourceFacts(parsed, { bindableProps });

				partsObj[part] = {
					props: parsed,
					...(fwdProps ? { forwardedProps: fwdProps } : {})
				};
			}
			propsOrParts = { parts: partsObj };
		} else {
			const contract = parsePropContract(indexContent, `${name}Props`, name);
			const parsed = contract.props;
			let fwdProps = contract.forwardedProps;

			// Merge props from primitives (base props that UI extends or re-exports)
			if (primContent) {
				const primContract = parsePropContract(primContent, `${name}Props`, name);
				for (const [key, val] of Object.entries(primContract.props)) {
					if (!parsed[key]) parsed[key] = val;
				}
				if (!fwdProps && primContract.forwardedProps) {
					fwdProps = primContract.forwardedProps;
				}
			}

			const bindableProps = findBindablePropsSimple(dir);
			const entries = await readdir(dirPath, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isFile() || !entry.name.endsWith('.svelte')) continue;
				try {
					applyPropSourceFacts(parsed, {
						defaults: parseDefaults(await readText(join(dirPath, entry.name)))
					});
				} catch {
					/* skip */
				}
			}
			applyPropSourceFacts(parsed, { bindableProps });

			propsOrParts = {
				props: parsed,
				...(fwdProps ? { forwardedProps: fwdProps } : {})
			};
		}

		const styleSurface = createStyleSurfaceAccumulator();
		const entries = await readdir(dirPath, { withFileTypes: true });

		async function scanForStyleSurface(
			filePath: string,
			filters?: StyleSurfaceFilters
		): Promise<void> {
			try {
				addStyleSurfaceSource(styleSurface, await readText(filePath), filters);
			} catch {
				/* file may not exist */
			}
		}

		for (const entry of entries) {
			if (!entry.isFile()) continue;
			if (!isStyleSurfaceFile(entry.name)) continue;
			await scanForStyleSurface(join(dirPath, entry.name));
		}

		// Shared style surfaces that these compound components render through.
		// The unified modal-content.svelte owns the dialog/panel markup + styles
		// for Dialog/Drawer/AlertDialog, so its data-* and --dry-* contract
		// needs to be reflected in each component's spec. Filter by component
		// prefix so each component advertises only its own data-* surface
		// (--dry-* filtering is broader since several shared tokens, e.g.
		// --dry-radius-nested, land inside component-specific scopes).
		for (const surface of sharedStyleSurfacesForComponent(name)) {
			await scanForStyleSurface(join(uiSrc, surface.path), surface);
		}

		const primDirPath = join(primSrc, dir);
		try {
			const primEntries = await readdir(primDirPath, { withFileTypes: true });
			for (const entry of primEntries) {
				if (!entry.isFile()) continue;
				if (!isStyleSurfaceFile(entry.name)) continue;
				await scanForStyleSurface(join(primDirPath, entry.name));
			}
		} catch {
			/* no primitive directory fallback */
		}

		const a11yNotes = getA11yNotes(name, meta);
		const finalizedStyleSurface = finalizeStyleSurface(styleSurface);
		const groups = propGroupsForComponent(name);

		components[name] = {
			import: '@dryui/ui',
			description: meta.description,
			category: meta.category,
			tags: meta.tags,
			compound,
			...propsOrParts,
			...(groups ? { groups } : {}),
			...(compound ? { structure: deriveStructure(example, name) } : {}),
			a11y: a11yNotes,
			cssVars: finalizedStyleSurface.cssVars,
			dataAttributes: finalizedStyleSurface.dataAttributes.map((attr) =>
				describeDataAttribute(name, attr)
			),
			example
		};
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

		const parts = parseCompoundParts(indexContent, name);
		const compound = parts !== null;
		const example = generateExample(name, compound, parts ?? undefined);
		let propsOrParts: Pick<ComponentShape, 'props' | 'parts' | 'forwardedProps'>;

		if (compound) {
			const partsObj: Record<string, PartShape> = {};
			for (const part of parts) {
				const contract = parsePartContract(indexContent, name, part, indexPath);
				const parsed = contract.props;
				const bindableProps = findBindableProps(dir, part);

				const partKebab = part.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
				const svelteFile = join(dirPath, `${dir}-${partKebab}.svelte`);
				try {
					applyPropSourceFacts(parsed, { defaults: parseDefaults(await readText(svelteFile)) });
				} catch {
					/* file may not exist */
				}
				applyPropSourceFacts(parsed, { bindableProps });

				partsObj[part] = {
					props: parsed,
					...(contract.forwardedProps ? { forwardedProps: contract.forwardedProps } : {})
				};
			}
			propsOrParts = { parts: partsObj };
		} else {
			const contract = parsePropContract(indexContent, `${name}Props`, name);
			const parsed = contract.props;
			const bindableProps = findBindablePropsSimple(dir);

			const entries = await readdir(dirPath, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isFile() || !entry.name.endsWith('.svelte')) continue;
				try {
					applyPropSourceFacts(parsed, {
						defaults: parseDefaults(await readText(join(dirPath, entry.name)))
					});
				} catch {
					/* skip */
				}
			}
			applyPropSourceFacts(parsed, { bindableProps });

			propsOrParts = {
				props: parsed,
				...(contract.forwardedProps ? { forwardedProps: contract.forwardedProps } : {})
			};
		}

		const dataAttributes = new Set<string>();
		const entries = await readdir(dirPath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isFile()) continue;
			const source = await readText(join(dirPath, entry.name));
			if (entry.name.endsWith('.module.css') || entry.name.endsWith('.svelte')) {
				for (const attr of collectDataAttributes(source)) {
					dataAttributes.add(attr);
				}
			}
		}

		const a11yNotes = getA11yNotes(name, meta);
		const groups = propGroupsForComponent(name);

		components[name] = {
			import: '@dryui/primitives',
			description: meta.description,
			category: meta.category,
			tags: meta.tags,
			compound,
			...propsOrParts,
			...(groups ? { groups } : {}),
			...(compound ? { structure: deriveStructure(example, name) } : {}),
			a11y: a11yNotes,
			cssVars: {},
			dataAttributes: [...dataAttributes].sort().map((attr) => describeDataAttribute(name, attr)),
			example
		};
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
