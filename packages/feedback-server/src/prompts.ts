import type { Submission, SubmissionDrawing } from './types.js';

export const FEEDBACK_LINTER_PROMPT_STEP =
	'Run the relevant project linter/check command and fix any violations before resolving.';
export const FEEDBACK_PIPELINE_PROMPT_STEP =
	'If PRODUCT.md or DESIGN.md exists at the project root (these are impeccable-owned), read them for context; treat this feedback as the highest-priority user intent, then preserve the durable product/design identity unless the feedback clearly overrides it.';

// Backwards-compatible default. Callers should pass the absolute path to the
// project-installed skill (`<project>/.claude/skills/dryui-feedback/SKILL.md`)
// surfaced via dispatch.ts:findInstalledSkill. This fallback string is only
// useful when no resolved path is available; the dispatched agent will fail
// to read it unless the user installs the skill via
// `npx skills add rob-balfre/dryui --skill dryui-feedback` first.
export const DEFAULT_FEEDBACK_SKILL_REFERENCE = '.claude/skills/dryui-feedback/SKILL.md';

export interface FeedbackPromptOptions {
	/** Absolute filesystem path to the canonical SKILL.md. */
	skillPath?: string;
}

export function getTextNotes(drawings: readonly SubmissionDrawing[] | undefined): string[] {
	if (!drawings) return [];
	return drawings.flatMap((drawing) =>
		drawing.kind === 'text' && typeof drawing.text === 'string' && drawing.text.length > 0
			? [drawing.text]
			: []
	);
}

function skillReference(options: FeedbackPromptOptions | undefined): string {
	return options?.skillPath ?? DEFAULT_FEEDBACK_SKILL_REFERENCE;
}

export function buildFeedbackDispatchPrompt(
	s: Pick<Submission, 'id' | 'url' | 'drawings'>,
	options?: FeedbackPromptOptions
): string {
	const textNotes = getTextNotes(s.drawings);
	const notes =
		textNotes.length > 0
			? `\n\nText notes from the annotation:\n${textNotes.map((note) => `- ${note}`).join('\n')}`
			: '';
	return `Apply DryUI feedback submission ${s.id} (from ${s.url}).

Read your canonical skill at \`${skillReference(options)}\` first — it has the submission shape, the intent kinds, the lint trip-wires, and the resolve handshake. Then fetch the submission, read the screenshot, apply the smallest source edit that satisfies the user's intent, run \`dryui check\`, and call \`feedback_resolve_submission\`.

${FEEDBACK_PIPELINE_PROMPT_STEP}${notes}`;
}

export function buildFeedbackBulkPrompt(options?: FeedbackPromptOptions): string {
	return `Process pending DryUI feedback submissions.

For each submission, spawn the **feedback** subagent (\`.claude/agents/feedback.md\`). It owns the full per-submission workflow: fetching, reading the screenshot, decoding intents, editing source, running \`dryui check\`, and calling \`feedback_resolve_submission\`. Its canonical skill at \`${skillReference(options)}\` carries all the rules — lint trip-wires and hand-off boundaries.

Call \`feedback_get_submissions\` once at the start to enumerate pending ids, then dispatch one feedback subagent per submission.

${FEEDBACK_PIPELINE_PROMPT_STEP}`;
}
