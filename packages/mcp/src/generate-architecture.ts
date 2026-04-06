import { buildDolphinGraph, writeArchitectureArtifacts } from './architecture.js';

async function main(): Promise<void> {
	console.log('Generating architecture graph...');
	const graph = await buildDolphinGraph();
	await writeArchitectureArtifacts(graph);
	console.log(`${graph.summary.componentNodes} component nodes`);
	console.log('Done');
}

if (import.meta.main) {
	await main();
}
