// dryui prompt --component <component> - Generate task-specific implementation context

import agentContractData from '@dryui/mcp/agent-contract.v1.json';
import {
	findAgentComponent,
	renderComponentPrompt,
	type AgentContractV1
} from '@dryui/mcp/agent-contract';
import {
	commandError,
	getFlag,
	hasFlag,
	printCommandHelp,
	resolveOutputMode,
	runCommand,
	type CommandResult,
	type OutputMode
} from '../run.js';

const defaultAgentContract = agentContractData as AgentContractV1;

function availableComponents(contract: AgentContractV1): string[] {
	return Object.keys(contract.components).sort((left, right) => left.localeCompare(right));
}

export function getPromptForComponent(
	query: string,
	contract: AgentContractV1,
	mode: OutputMode,
	options: { verbose?: boolean } = {}
): CommandResult {
	const component = findAgentComponent(contract, query);
	if (!component) {
		return commandError(
			mode,
			'not-found',
			`Unknown component: "${query}"`,
			availableComponents(contract)
		);
	}

	const output = renderComponentPrompt(contract, component.name, options);
	if (!output) {
		return commandError(
			mode,
			'not-found',
			`Unknown component: "${query}"`,
			availableComponents(contract)
		);
	}

	return { output, error: null, exitCode: 0 };
}

function printPromptHelp(): never {
	return printCommandHelp({
		usage: 'dryui prompt --component <component> [--verbose]',
		description: ['Generate deterministic DryUI implementation context for an agent.'],
		options: [
			'  --component <name>  Component to generate prompt context for',
			'  --verbose           Include prop and accessibility reference'
		],
		examples: ['  dryui prompt --component Button', '  dryui prompt --component Tabs --verbose']
	});
}

export function getPrompt(
	args: string[],
	contract: AgentContractV1,
	mode: OutputMode
): CommandResult {
	const component = getFlag(args, '--component');
	if (!component || component.startsWith('--')) {
		return commandError(mode, 'missing-component', 'prompt requires --component <name>', [
			'dryui prompt --component Button',
			'dryui list'
		]);
	}

	return getPromptForComponent(component, contract, mode, {
		verbose: hasFlag(args, '--verbose') || hasFlag(args, '--full')
	});
}

export function runPrompt(args: string[], contract: AgentContractV1 = defaultAgentContract): void {
	if (args[0] === '--help' || args[0] === '-h') {
		printPromptHelp();
	}

	const { mode } = resolveOutputMode(args, false);
	runCommand(getPrompt(args, contract, mode), mode);
}
