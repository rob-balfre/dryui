import { writeAgentContractArtifacts } from './agent-contract.js';

async function main(): Promise<void> {
	console.log('Generating agent contract artifacts...');
	await writeAgentContractArtifacts();
	console.log('Done');
}

if (import.meta.main) {
	await main();
}
