import type { Submission, SubmissionDrawing } from './types.js';

export const FEEDBACK_LINTER_PROMPT_STEP =
	'Run the relevant project linter/check command and fix any violations before resolving.';
export const FEEDBACK_PIPELINE_PROMPT_STEP =
	'If PRODUCT.md or DESIGN.md exists at the project root (these are impeccable-owned), read them for context; treat this feedback as the highest-priority user intent, then preserve the durable product/design identity unless the feedback clearly overrides it.';

export function getTextNotes(drawings: readonly SubmissionDrawing[] | undefined): string[] {
	if (!drawings) return [];
	return drawings.flatMap((drawing) =>
		drawing.kind === 'text' && typeof drawing.text === 'string' && drawing.text.length > 0
			? [drawing.text]
			: []
	);
}

export function buildFeedbackDispatchPrompt(
	s: Pick<Submission, 'id' | 'url' | 'drawings'>
): string {
	const textNotes = getTextNotes(s.drawings);
	const notes =
		textNotes.length > 0
			? `\n\nText notes from the annotation:\n${textNotes.map((note) => `- ${note}`).join('\n')}`
			: '';
	return `Apply DryUI feedback submission ${s.id} (from ${s.url}).

Read your canonical skill at \`node_modules/@dryui/feedback-server/skills/dryui-feedback/SKILL.md\` first — it has the submission shape, the four intent kinds, the AreaGrid no-gap rule, the lint trip-wires, and the resolve handshake. Then fetch the submission, read the screenshot, apply the smallest source edit that satisfies the user's intent, run \`dryui check\`, and call \`feedback_resolve_submission\`.

${FEEDBACK_PIPELINE_PROMPT_STEP}${notes}`;
}

export function buildFeedbackBulkPrompt(): string {
	return `Process pending DryUI feedback submissions.

For each submission, spawn the **feedback** subagent (\`.claude/agents/feedback.md\`). It owns the full per-submission workflow: fetching, reading the screenshot, decoding intents, editing source, running \`dryui check\`, and calling \`feedback_resolve_submission\`. Its canonical skill at \`node_modules/@dryui/feedback-server/skills/dryui-feedback/SKILL.md\` carries all the rules — AreaGrid no-gap, lint trip-wires, hand-off boundaries.

Call \`feedback_get_submissions\` once at the start to enumerate pending ids, then dispatch one feedback subagent per submission.

${FEEDBACK_PIPELINE_PROMPT_STEP}`;
}
