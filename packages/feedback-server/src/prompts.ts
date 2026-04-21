import type { Submission, SubmissionDrawing } from './types.js';

export const FEEDBACK_LINTER_PROMPT_STEP =
	'Run the relevant project linter/check command and fix any violations before resolving.';

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
	return `Work on DryUI feedback submission ${s.id} from ${s.url}.

Use the dryui-feedback MCP server:
1. Call feedback_get_submissions to fetch the latest submission details
2. Read the screenshot at screenshotPath.png (fallback to screenshotPath.webp) to see what the user annotated
3. Review the drawings and the parallel hints array (corner, percentX/percentY, element) to locate each mark in the viewport
4. Apply the fixes following DryUI conventions (CSS grid layout, --dry-* tokens, component usage)
5. ${FEEDBACK_LINTER_PROMPT_STEP}
6. Call feedback_resolve_submission with id "${s.id}" once resolved${notes}`;
}

export function buildFeedbackBulkPrompt(): string {
	return `Work on pending DryUI feedback submissions.

Use the dryui-feedback MCP server:
1. Call feedback_get_submissions to list pending submissions
2. For each submission, read the screenshot at screenshotPath.png (fallback to screenshotPath.webp)
3. Review the drawings and the parallel hints array (corner, percentX/percentY, element) to locate each mark in the viewport
4. Apply the fixes following DryUI conventions (CSS grid layout, --dry-* tokens, component usage)
5. ${FEEDBACK_LINTER_PROMPT_STEP}
6. Call feedback_resolve_submission with the submission id after each fix is complete`;
}
