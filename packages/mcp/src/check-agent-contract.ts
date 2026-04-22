import { readFileSync } from 'node:fs';
import {
	agentContractJsonPath,
	agentContractSchemaPath,
	buildAgentContractArtifacts
} from './agent-contract.js';

function readText(path: string): string {
	return readFileSync(path, 'utf8');
}

function main(): void {
	const artifacts = buildAgentContractArtifacts();
	const currentContract = readText(agentContractJsonPath);
	const currentSchema = readText(agentContractSchemaPath);

	const errors: string[] = [];
	if (currentContract !== artifacts.contractJson) {
		errors.push(`agent-contract.v1.json is out of date at ${agentContractJsonPath}`);
	}
	if (currentSchema !== artifacts.schemaJson) {
		errors.push(`agent-contract.v1.schema.json is out of date at ${agentContractSchemaPath}`);
	}

	if (errors.length > 0) {
		console.error(errors.join('\n'));
		process.exit(1);
	}

	console.log('Agent contract artifacts are up to date.');
}

if (import.meta.main) {
	main();
}
