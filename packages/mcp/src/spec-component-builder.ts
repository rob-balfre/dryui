import { join } from 'node:path';
import { componentImplementationDir } from './component-identity.js';
import type { ComponentMetaEntry } from './component-catalog.js';
import {
	applyPropSourceFacts,
	collectDataAttributes,
	findBindableProps,
	findBindablePropsSimple,
	parseCompoundParts,
	parseDefaults,
	parsePartContract as parsePartContractFromSource,
	parsePropContract as parsePropContractFromSource,
	type DataAttributeShape,
	type ForwardedPropsShape,
	type PartShape,
	type PropShape
} from './spec-source-extraction.js';
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

type ComponentSpecBuilderFs = {
	readText(filePath: string): Promise<string>;
	listFileNames(dirPath: string): Promise<string[]>;
};

type SourceLayer = {
	dirPath: string;
	indexPath: string;
	indexContent: string;
};

type BuildComponentSpecOptions = {
	name: string;
	meta: ComponentMetaEntry;
	source: SourceLayer;
	fs: ComponentSpecBuilderFs;
	uiSrc?: string;
	primitiveSource?: SourceLayer | null;
	importPath: '@dryui/ui' | '@dryui/primitives';
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

async function applySvelteDefaults(
	props: Record<string, PropShape>,
	filePath: string,
	fs: ComponentSpecBuilderFs
): Promise<void> {
	try {
		applyPropSourceFacts(props, { defaults: parseDefaults(await fs.readText(filePath)) });
	} catch {
		/* file may not exist */
	}
}

async function buildPropsOrParts(
	options: BuildComponentSpecOptions,
	compound: boolean,
	parts: string[] | null
): Promise<Pick<ComponentShape, 'props' | 'parts' | 'forwardedProps'>> {
	const { name, source, primitiveSource, fs } = options;
	const dir = componentImplementationDir(name);

	if (compound) {
		const partsObj: Record<string, PartShape> = {};
		for (const part of parts ?? []) {
			const contract = parsePartContract(source.indexContent, name, part, source.indexPath);
			const parsed = contract.props;
			let fwdProps = contract.forwardedProps;

			if (primitiveSource) {
				const primContract = parsePartContract(
					primitiveSource.indexContent,
					name,
					part,
					primitiveSource.indexPath
				);
				for (const [key, val] of Object.entries(primContract.props)) {
					if (!parsed[key]) parsed[key] = val;
				}
				if (!fwdProps && primContract.forwardedProps) {
					fwdProps = primContract.forwardedProps;
				}
			}

			const bindableProps = findBindableProps(dir, part);
			const partKebab = part.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
			await applySvelteDefaults(parsed, join(source.dirPath, `${dir}-${partKebab}.svelte`), fs);
			applyPropSourceFacts(parsed, { bindableProps });

			partsObj[part] = {
				props: parsed,
				...(fwdProps ? { forwardedProps: fwdProps } : {})
			};
		}
		return { parts: partsObj };
	}

	const contract = parsePropContract(source.indexContent, `${name}Props`, name);
	const parsed = contract.props;
	let fwdProps = contract.forwardedProps;

	if (primitiveSource) {
		const primContract = parsePropContract(primitiveSource.indexContent, `${name}Props`, name);
		for (const [key, val] of Object.entries(primContract.props)) {
			if (!parsed[key]) parsed[key] = val;
		}
		if (!fwdProps && primContract.forwardedProps) {
			fwdProps = primContract.forwardedProps;
		}
	}

	const bindableProps = findBindablePropsSimple(dir);
	const entries = await fs.listFileNames(source.dirPath);
	for (const entry of entries) {
		if (!entry.endsWith('.svelte')) continue;
		await applySvelteDefaults(parsed, join(source.dirPath, entry), fs);
	}
	applyPropSourceFacts(parsed, { bindableProps });

	return {
		props: parsed,
		...(fwdProps ? { forwardedProps: fwdProps } : {})
	};
}

async function collectUiStyleSurface(
	name: string,
	source: SourceLayer,
	options: BuildComponentSpecOptions
): Promise<Pick<ComponentShape, 'cssVars' | 'dataAttributes'>> {
	const { fs, primitiveSource, uiSrc } = options;
	const styleSurface = createStyleSurfaceAccumulator();

	async function scanForStyleSurface(
		filePath: string,
		filters?: StyleSurfaceFilters
	): Promise<void> {
		try {
			addStyleSurfaceSource(styleSurface, await fs.readText(filePath), filters);
		} catch {
			/* file may not exist */
		}
	}

	for (const entry of await fs.listFileNames(source.dirPath)) {
		if (!isStyleSurfaceFile(entry)) continue;
		await scanForStyleSurface(join(source.dirPath, entry));
	}

	if (uiSrc) {
		for (const surface of sharedStyleSurfacesForComponent(name)) {
			await scanForStyleSurface(join(uiSrc, surface.path), surface);
		}
	}

	if (primitiveSource) {
		try {
			for (const entry of await fs.listFileNames(primitiveSource.dirPath)) {
				if (!isStyleSurfaceFile(entry)) continue;
				await scanForStyleSurface(join(primitiveSource.dirPath, entry));
			}
		} catch {
			/* no primitive directory fallback */
		}
	}

	const finalizedStyleSurface = finalizeStyleSurface(styleSurface);
	return {
		cssVars: finalizedStyleSurface.cssVars,
		dataAttributes: finalizedStyleSurface.dataAttributes.map((attr) =>
			describeDataAttribute(name, attr)
		)
	};
}

async function collectPrimitiveStyleSurface(
	name: string,
	source: SourceLayer,
	fs: ComponentSpecBuilderFs
): Promise<Pick<ComponentShape, 'cssVars' | 'dataAttributes'>> {
	const dataAttributes = new Set<string>();
	const entries = await fs.listFileNames(source.dirPath);
	for (const entry of entries) {
		const sourceText = await fs.readText(join(source.dirPath, entry));
		if (entry.endsWith('.module.css') || entry.endsWith('.svelte')) {
			for (const attr of collectDataAttributes(sourceText)) {
				dataAttributes.add(attr);
			}
		}
	}

	return {
		cssVars: {},
		dataAttributes: [...dataAttributes].sort().map((attr) => describeDataAttribute(name, attr))
	};
}

async function buildComponentSpec(options: BuildComponentSpecOptions): Promise<ComponentShape> {
	const { name, meta, source, importPath } = options;
	const parts = parseCompoundParts(source.indexContent, name);
	const compound = parts !== null;
	const example = generateExample(name, compound, parts ?? undefined);
	const propsOrParts = await buildPropsOrParts(options, compound, parts);
	const styleSurface =
		importPath === '@dryui/ui'
			? await collectUiStyleSurface(name, source, options)
			: await collectPrimitiveStyleSurface(name, source, options.fs);
	const a11yNotes = getA11yNotes(name, meta);
	const groups = propGroupsForComponent(name);

	return {
		import: importPath,
		description: meta.description,
		category: meta.category,
		tags: meta.tags,
		compound,
		...propsOrParts,
		...(groups ? { groups } : {}),
		...(compound ? { structure: deriveStructure(example, name) } : {}),
		a11y: a11yNotes,
		cssVars: styleSurface.cssVars,
		dataAttributes: styleSurface.dataAttributes,
		example
	};
}

export {
	buildComponentSpec,
	parsePartContract,
	parsePropContract,
	type BuildComponentSpecOptions,
	type ComponentShape,
	type ComponentSpecBuilderFs,
	type SourceLayer
};
