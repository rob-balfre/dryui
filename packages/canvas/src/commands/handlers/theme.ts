import { touchDocument, type ApplyResult, type CommandTarget } from './utils.js';
import type { SetThemeVarCommand } from '../types.js';

export function applySetThemeVar(
	target: CommandTarget,
	command: SetThemeVarCommand
): ApplyResult<SetThemeVarCommand> {
	const previousValue = target.document.theme.vars[command.varName] ?? '';
	target.document.theme.vars[command.varName] = command.value;
	touchDocument(target.document);

	return {
		inverse: {
			...command,
			value: previousValue
		},
		label: `Set ${command.varName}`
	};
}
