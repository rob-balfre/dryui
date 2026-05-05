import { getSubmissionTextNotes } from './submission-presentation.js';
import type { SubmissionPresentation } from './submission-presentation.js';
import type { Submission, SubmissionDrawing } from './types.js';

export const FEEDBACK_LINTER_PROMPT_STEP =
	'Run the relevant project linter/check command and fix any violations before resolving.';
export const FEEDBACK_PIPELINE_PROMPT_STEP =
	'If PRODUCT.md or DESIGN.md exists at the project root (these are impeccable-owned), read them for context; treat this feedback as the highest-priority user intent, then preserve the durable product/design identity unless the feedback clearly overrides it.';

// Fallback path used when callers do not pass a resolved absolute path. The
// dispatched agent will fail to read it unless the skill is installed in the
// project via `npx skills add rob-balfre/dryui --skill dryui-feedback`.
export const DEFAULT_FEEDBACK_SKILL_REFERENCE = '.claude/skills/dryui-feedback/SKILL.md';

export interface FeedbackPromptOptions {
	/** Absolute filesystem path to the canonical SKILL.md. */
	skillPath?: string;
}

export type FeedbackDispatchPromptSubmission = Pick<Submission, 'id' | 'url' | 'drawings'> &
	Partial<Pick<SubmissionPresentation, 'textNotes'>>;

export function getTextNotes(drawings: readonly SubmissionDrawing[] | undefined): string[] {
	return getSubmissionTextNotes(drawings);
}

function skillReference(options: FeedbackPromptOptions | undefined): string {
	return options?.skillPath ?? DEFAULT_FEEDBACK_SKILL_REFERENCE;
}

export function buildFeedbackDispatchPrompt(
	s: FeedbackDispatchPromptSubmission,
	options?: FeedbackPromptOptions
): string {
	const textNotes = s.textNotes ?? getSubmissionTextNotes(s.drawings);
	const notes =
		textNotes.length > 0
			? `\n\nText notes from the annotation:\n${textNotes.map((note) => `- ${note}`).join('\n')}`
			: '';
	return `Apply DryUI feedback submission ${s.id} (from ${s.url}).

Read your canonical skill at \`${skillReference(options)}\` first — it has the submission shape, the intent kinds, the lint trip-wires, and the resolve handshake. Then fetch the submission, read the screenshot, apply the smallest source edit that satisfies the user's intent, run the relevant project checks, and call \`feedback_resolve_submission\`.

${FEEDBACK_PIPELINE_PROMPT_STEP}${notes}`;
}

export function buildFeedbackBulkPrompt(options?: FeedbackPromptOptions): string {
	return `Process pending DryUI feedback submissions.

For each submission, spawn the **feedback** subagent (\`.claude/agents/feedback.md\`). It owns the full per-submission workflow: fetching, reading the screenshot, decoding intents, editing source, running the relevant project checks, and calling \`feedback_resolve_submission\`. Its canonical skill at \`${skillReference(options)}\` carries all the rules — lint trip-wires and hand-off boundaries.

Call \`feedback_get_submissions\` once at the start to enumerate pending ids, then dispatch one feedback subagent per submission.

${FEEDBACK_PIPELINE_PROMPT_STEP}`;
}
