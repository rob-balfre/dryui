import { readFileSync } from 'node:fs';
import { buildContractArtifacts, contractJsonPath, contractSchemaPath } from './contract.js';

function readText(path: string): string {
	return readFileSync(path, 'utf8');
}

function main(): void {
	const artifacts = buildContractArtifacts();
	const currentContract = readText(contractJsonPath);
	const currentSchema = readText(contractSchemaPath);

	const errors: string[] = [];
	if (currentContract !== artifacts.contractJson) {
		errors.push(`contract.v1.json is out of date at ${contractJsonPath}`);
	}
	if (currentSchema !== artifacts.schemaJson) {
		errors.push(`contract.v1.schema.json is out of date at ${contractSchemaPath}`);
	}

	if (errors.length > 0) {
		console.error(errors.join('\n'));
		process.exit(1);
	}

	console.log('Contract artifacts are up to date.');
}

if (import.meta.main) {
	main();
}
