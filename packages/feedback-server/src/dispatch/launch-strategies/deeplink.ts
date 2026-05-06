import type { DeeplinkAgent } from '../agents.js';
import type { LaunchStrategy } from '../launch.js';
import { probeMacApps } from './shared.js';

export const deeplink: LaunchStrategy<DeeplinkAgent> = {
	probe(agent, _workspace, ctx) {
		return ctx.commandExists(agent.cliCommand) || probeMacApps(agent, ctx);
	},
	launch(agent, prompt, options, ctx) {
		const fullPrompt = (agent.promptPrefix ?? '') + prompt;
		const url = agent.urlTemplate
			.replace('{prompt}', encodeURIComponent(fullPrompt))
			.replace('{workspace}', encodeURIComponent(options.workspace));
		ctx.openExternalUrl(url);
	}
};
