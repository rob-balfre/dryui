import { writeFile } from 'node:fs/promises';
import { buildDolphinGraph } from './architecture.js';

const architectureJsonPath = new URL('./architecture.json', import.meta.url);

async function main(): Promise<void> {
	console.log('Generating architecture graph...');
	const graph = await buildDolphinGraph();
	await writeFile(architectureJsonPath, `${JSON.stringify(graph, null, 2)}\n`);
	console.log(`${graph.summary.componentNodes} component nodes`);
	console.log('Done');
}

if (import.meta.main) {
	await main();
}
