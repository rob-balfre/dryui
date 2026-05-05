import {
	AGENT_DISPLAY_INFO,
	type DispatchAgent,
	type DispatchAgentDisplayInfo
} from '../../src/dispatch/agents.js';

export type { DispatchAgent };

export const AGENT_INFO: Readonly<Record<DispatchAgent, DispatchAgentDisplayInfo>> =
	AGENT_DISPLAY_INFO;
