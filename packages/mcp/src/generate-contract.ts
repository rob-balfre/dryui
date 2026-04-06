import { writeContractArtifacts } from './contract.js';

async function main(): Promise<void> {
	console.log('Generating contract artifacts...');
	await writeContractArtifacts();
	console.log('Done');
}

if (import.meta.main) {
	await main();
}
