import type { Submission } from './types.js';

export const FEEDBACK_LINTER_PROMPT_STEP =
	'Run the relevant project linter/check command and fix any violations before resolving.';

export function buildFeedbackDispatchPrompt(s: Pick<Submission, 'id' | 'url'>): string {
	return `New feedback submission ${s.id} on ${s.url}. Call feedback_get_submissions via the dryui-feedback MCP to fetch the screenshot and drawings, act on the change, run the relevant project linter/check command and fix any violations, then resolve with feedback_resolve_submission.`;
}
