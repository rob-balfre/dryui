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

Spawn the **feedback** subagent (\`.claude/agents/feedback.md\`). It owns this entire workflow: fetching the submission, reading the screenshot, decoding the four intent kinds (drawings / components / removed / layoutBoxes), making the smallest source edit that satisfies them, running \`dryui check\`, and calling \`feedback_resolve_submission\`.

Pass the submission id "${s.id}" through. The agent will read its canonical skill at \`node_modules/@dryui/feedback-server/skills/dryui-feedback/SKILL.md\` for the full rules — including the AreaGrid no-gap / use-padding rule, the lint trip-wires that crash the dev server, and when to hand off to \`dryui-layout\` instead of editing template-areas directly.

${FEEDBACK_PIPELINE_PROMPT_STEP}${notes}`;
}

export function buildFeedbackBulkPrompt(): string {
	return `Process pending DryUI feedback submissions.

For each submission, spawn the **feedback** subagent (\`.claude/agents/feedback.md\`). It owns the full per-submission workflow: fetching, reading the screenshot, decoding intents, editing source, running \`dryui check\`, and calling \`feedback_resolve_submission\`. Its canonical skill at \`node_modules/@dryui/feedback-server/skills/dryui-feedback/SKILL.md\` carries all the rules — AreaGrid no-gap, lint trip-wires, hand-off boundaries.

Call \`feedback_get_submissions\` once at the start to enumerate pending ids, then dispatch one feedback subagent per submission.

${FEEDBACK_PIPELINE_PROMPT_STEP}`;
}
