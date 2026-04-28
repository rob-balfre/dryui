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
	return `Work on DryUI feedback submission ${s.id} from ${s.url}.

Use the dryui-feedback MCP server:
1. Call feedback_get_submissions to fetch the latest submission details
2. Read the screenshot at screenshotPath.png (fallback to screenshotPath.webp) to see what the user annotated
3. Review the drawings and the parallel hints array (corner, percentX/percentY, element) to locate each mark in the viewport
4. If the submission has a components array, treat each entry as a placement intent: kind is the DryUI component to add at rect (viewport coords), label/props capture the user's chosen configuration. Outline + chip overlays in the screenshot mark these placements
5. If the submission has a removed array, treat each entry as a removal intent: tag/selector identify the page element the user wants gone. Dashed red outlines in the screenshot mark these removals
6. If the submission has a layoutBoxes array, treat each entry as a layout-region intent: label is the user's name for a new region, pageX/pageY/width/height locate it in page coordinates (subtract scroll to get viewport coords). Cyan rectangles in the screenshot mark these regions. Decide where each box belongs in the existing AreaGrid (or propose a new template) and add a corresponding named area + content
7. ${FEEDBACK_PIPELINE_PROMPT_STEP}
8. Apply the fixes following DryUI conventions (CSS grid layout, --dry-* tokens, component usage)
9. ${FEEDBACK_LINTER_PROMPT_STEP}
10. Call feedback_resolve_submission with id "${s.id}" once resolved${notes}`;
}

export function buildFeedbackBulkPrompt(): string {
	return `Work on pending DryUI feedback submissions.

Use the dryui-feedback MCP server:
1. Call feedback_get_submissions to list pending submissions
2. For each submission, read the screenshot at screenshotPath.png (fallback to screenshotPath.webp)
3. Review the drawings and the parallel hints array (corner, percentX/percentY, element) to locate each mark in the viewport
4. If the submission has a components array, treat each entry as a placement intent: kind is the DryUI component to add at rect (viewport coords), label/props capture the user's chosen configuration. Outline + chip overlays in the screenshot mark these placements
5. If the submission has a removed array, treat each entry as a removal intent: tag/selector identify the page element the user wants gone. Dashed red outlines in the screenshot mark these removals
6. If the submission has a layoutBoxes array, treat each entry as a layout-region intent: label names a new region the user wants, pageX/pageY/width/height locate it in page coordinates. Cyan rectangles in the screenshot mark these regions. Decide where each box belongs in the existing AreaGrid (or propose a new template) and add a corresponding named area + content
7. ${FEEDBACK_PIPELINE_PROMPT_STEP}
8. Apply the fixes following DryUI conventions (CSS grid layout, --dry-* tokens, component usage)
9. ${FEEDBACK_LINTER_PROMPT_STEP}
10. Call feedback_resolve_submission with the submission id after each fix is complete`;
}
