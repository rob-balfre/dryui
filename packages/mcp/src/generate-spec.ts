import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	generateExample,
	generateSpec,
	parseCompoundParts,
	parseDefaults,
	parsePartContract,
	partPropInterfaceNames
} from './spec-generation.js';
import { loadComponentMeta } from './load-component-meta.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uiSrc = resolve(__dirname, '../../ui/src');
const primSrc = resolve(__dirname, '../../primitives/src');
const outPath = resolve(__dirname, 'spec.json');

async function main(): Promise<void> {
	console.log('Generating spec...');
	const { entries: metaEntries } = await loadComponentMeta();
	console.log(`  Loaded ${Object.keys(metaEntries).length} component meta files`);

	const spec = await generateSpec({ uiSrc, primSrc, componentMeta: metaEntries });
	await writeFile(outPath, JSON.stringify(spec, null, 2));

	console.log(`${Object.keys(spec.components).length} components`);
	console.log('Done');
}

export {
	parseCompoundParts,
	parsePartContract,
	generateExample,
	partPropInterfaceNames,
	parseDefaults
};

if (import.meta.main) {
	await main();
}
