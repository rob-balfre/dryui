import type { LayoutDocument } from './types.js';

export interface SystemPromptOptions {
	readonly document?: LayoutDocument;
	readonly workspaceName?: string;
	readonly specSummary?: string;
	readonly extraInstructions?: string[];
}

function summarizeDocument(document?: LayoutDocument): string {
	if (!document) {
		return 'No document is loaded yet.';
	}

	const nodeCount = countNodes(document.root);
	const themeLabel = document.theme.label ?? document.theme.id;
	return [
		`Document: ${document.name}`,
		`Version: ${document.version}`,
		`Canvas: ${document.canvas.width} x ${document.canvas.height}`,
		`Theme: ${themeLabel}`,
		`Nodes: ${nodeCount}`
	].join('\n');
}

function countNodes(node: LayoutDocument['root']): number {
	let count = 1;
	for (const child of node.children) {
		count += countNodes(child as LayoutDocument['root']);
	}
	return count;
}

export function buildSystemPrompt(options: SystemPromptOptions = {}): string {
	const sections = [
		'You are DryUI Studio, an assistant that edits a JSON layout AST through explicit commands.',
		'Return only valid JSON command payloads when asked to make changes.',
		options.workspaceName ? `Workspace: ${options.workspaceName}` : null,
		options.specSummary ? `Component spec:\n${options.specSummary}` : null,
		summarizeDocument(options.document),
		options.extraInstructions?.length
			? `Additional instructions:\n- ${options.extraInstructions.join('\n- ')}`
			: null,
		'Allowed commands: insert-node, remove-node, move-node, set-prop, set-css-var, set-style, set-text, set-theme-var, select-node, deselect-all, duplicate-node, batch.',
		'Prefer small, reversible changes. Preserve the existing structure unless the user explicitly asks for a rewrite.'
	].filter((section): section is string => section !== null);

	return sections.join('\n\n');
}
